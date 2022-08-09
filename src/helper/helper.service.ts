import { Injectable } from '@nestjs/common';
import { MessageCollection } from './message';

@Injectable()
export class HelperService {
  private messages = {};
  constructor() {}

  messageCollectionGen() {
    return new MessageCollection();
  }
  setMessage(key: any, mesasge: string) {
    if (!this.messages[key]) this.messages[key] = [];

    this.messages[key] = [...this.messages[key], mesasge];
  }

  setFlagMessage(flag: boolean, key: any, mesasge: string) {
    if (flag) {
      this.setMessage(key, mesasge);
    }
  }

  allMessages(key: any): string[] | null {
    return this.messages[key];
  }
}
