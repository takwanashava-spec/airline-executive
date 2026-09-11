"use client";

import { useState } from "react";
import { Archive, Mail, MailOpen, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AirlineState, InboxAction } from "@/types/game";

export function InboxView({ game, onRead, onRespond }: {
  game: AirlineState;
  onRead: (messageId: string) => void;
  onRespond: (messageId: string, action: InboxAction["id"], amount?: number) => void;
}) {
  const [selected, setSelected] = useState(game.inbox[0]?.id ?? null);
  const mail = game.inbox.find((item) => item.id === selected) ?? null;

  const open = (id: string) => {
    setSelected(id);
    onRead(id);
  };

  return (
    <section className="executive-inbox">
      <aside className="inbox-list panel">
        <div className="panel-heading compact"><div><span className="panel-eyebrow">EXECUTIVE OFFICE</span><h2>Inbox</h2></div><strong>{game.inbox.filter((item) => item.status === "unread").length} unread</strong></div>
        {game.inbox.length === 0 ? <div className="inbox-empty"><Mail /><strong>No correspondence</strong><span>Transaction decisions and operational notices will arrive here.</span></div> : game.inbox.map((item) => (
          <button type="button" key={item.id} className={`inbox-row ${selected === item.id ? "active" : ""} ${item.status === "unread" ? "unread" : ""}`} onClick={() => open(item.id)}>
            {item.status === "unread" ? <Mail /> : <MailOpen />}
            <span><strong>{item.senderCompany}</strong><b>{item.subject}</b><small>{new Date(item.receivedAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</small></span>
          </button>
        ))}
      </aside>

      <article className="inbox-reader panel">
        {mail ? <>
          <header><span className={`mail-priority ${mail.priority}`}>{mail.priority}</span><h2>{mail.subject}</h2><p>From <strong>{mail.senderName}</strong> · {mail.senderCompany}</p><small>{new Date(mail.receivedAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</small></header>
          <div className="mail-body">{mail.body.split("\n").map((line, index) => <p key={index}>{line || "\u00a0"}</p>)}</div>
          {mail.responseDeadline && <div className="mail-deadline">Response requested by {new Date(mail.responseDeadline).toLocaleString("en-ZA", { timeZone: "UTC" })}</div>}
          {mail.actions.length > 0 && <footer>{mail.actions.map((action) => <Button key={action.id} variant={action.id === "withdraw" ? "outline" : "default"} onClick={() => {
            let amount: number | undefined;
            if (action.requiresAmount) {
              const value = window.prompt("Enter your revised bid amount");
              if (value === null) return;
              amount = Number(value.replace(/[^0-9.]/g, ""));
            }
            onRespond(mail.id, action.id, amount);
          }}>{action.id === "withdraw" ? <Archive /> : <Reply />}{action.label}</Button>)}</footer>}
        </> : <div className="inbox-empty"><MailOpen /><strong>Select a message</strong><span>Open correspondence to review and respond.</span></div>}
      </article>
    </section>
  );
}
