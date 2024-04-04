import { ChatData } from "@/types";

class ChatHistory {
  private repository: ChatData[];

  constructor() {
    this.repository = [];
  }
  append_message(data: ChatData) {
    this.repository.push(data);
  }
  messages() {
    return this.repository;
  }

  last_message() {
    if (this.repository.length > 0) {
      return this.repository[this.repository.length - 1];
    }
  }
}

export default ChatHistory;
