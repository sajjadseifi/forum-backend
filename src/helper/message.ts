export class MessageCollection {
  private data: string[];

  constructor() {
    this.data = [];
  }

  setMessage(mesasge: string) {
    this.data.push(mesasge);
  }

  setFlagMessage(flag: boolean, mesasge: string) {
    if (flag) {
      this.setMessage(mesasge);
    }
  }

  get messages(): string[] {
    return [...this.data];
  }
}
