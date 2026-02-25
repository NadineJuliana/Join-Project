export class Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  color: string;

  constructor(data: Partial<Contact>) {
    this.id = data.id ?? 0;
    this.name = this.getFormattedName(data.name ?? '');
    this.email = data.email ?? '';
    this.phone = this.getFormattedPhone(data.phone ?? '');
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
      '#FF4646',
      '#00BEE8',
    ];
    const randomColor = Math.floor(Math.random() * colors.length);
    return colors[randomColor];
  }

  getCleanAddJson() {
    return {
      name: this.getFormattedName(this.name),
      email: this.email,
      phone: this.getFormattedPhone(this.phone),
      color: this.color,
    };
  }

  getFormattedName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .split(' ')
      .filter((i) => i.length > 0)
      .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
      .join(' ');
  }

  getPrettyPhone(phone: string): string {
    const match = phone.match(/^(\+\d{2})(\d{3})(\d+)$/);
    if (!match) return phone;
    return `${match[1]} ${match[2]} ${match[3].replace(/(\d{3})(?=\d)/g, '$1 ')}`;
  }

  getFormattedPhone(phone?: string | null): string {
    if (!phone) return '';
    phone = phone.replace(/[^\d+]/g, '');
    if (phone.startsWith('0')) {
      phone = '+49' + phone.substring(1);
    }
    return this.getPrettyPhone(phone);
  }
}
