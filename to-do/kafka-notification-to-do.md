# To-do: Kafka notification system (message queues)

See full design: [`server/notes/kafka-notification-system.md`](../server/notes/kafka-notification-system.md)

## Intent

Build a **notification system on Kafka**. Domain events are published once; **different services** in this project subscribe and respond (notification/email, audit, later assignments/enrollments alerts).

Keep **BullMQ + Redis** for actual email send + retries.

## Services that will respond

| Service / area | Reacts to (examples) |
|----------------|----------------------|
| Notification (new) | `user.registered`, `payment.completed`, `assignment.due_soon` |
| Email worker (BullMQ) | Jobs enqueued *by* notification consumer |
| Audit / logs (optional) | Auth + payment events |
| Future in-app UI | Same notification events |

## Producers (this repo)

- Auth, payments, enrollments, courses, assignments APIs

## Not started

- [ ] Compose Kafka
- [ ] Event schema + producers
- [ ] Notification consumer
- [ ] Wire to existing BullMQ email queue
