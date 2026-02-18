export class Contact {
  id: number;
  name: string;
  email: string;
  phone: string;

  constructor(data: Partial<Contact>) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.email = data.email ?? '';
    this.phone = data.phone ?? '';
  }

  getCleanAddJson() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone
    };
  }

}
