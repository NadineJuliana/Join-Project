export class Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  color: string;

  constructor(data: Partial<Contact>) {
    this.id = data.id ?? 0;
    this.name = data.name ?? '';
    this.email = data.email ?? '';
    this.phone = data.phone ?? '';
    this.color = data.color ?? this.getRandomColor();
  }

  getRandomColor(): string {
    const colors = [
      '#FF7A00',
      '#9327FF',
      '#6E52FF',
      '#FC71FF',
      '#FFBB2B',
      '#1FD7C1',
      '#462F8A',
    ];
    const randomColor = Math.floor(Math.random() * colors.length);
    return colors[randomColor];
  }

  getCleanAddJson() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      color: this.color,
    };
  }
}
