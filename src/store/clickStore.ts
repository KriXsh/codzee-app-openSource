export interface ClickEvent {
  code: string;
  timestamp: string;
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
}

export class ClickStore {
  private readonly events = new Map<string, ClickEvent[]>();

  record(event: ClickEvent): void {
    const list = this.events.get(event.code) ?? [];
    list.push(event);
    this.events.set(event.code, list);
  }

  forCode(code: string): ClickEvent[] {
    return this.events.get(code) ?? [];
  }

  clear(): void {
    this.events.clear();
  }
}
