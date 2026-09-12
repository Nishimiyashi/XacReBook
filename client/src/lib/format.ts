export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount) + '₮';
}

export function timeRemaining(endsAt: string | null): string {
  if (!endsAt) return '';
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Дуудлага худалдаа дууссан';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} өдөр ${hours % 24} цаг үлдлээ`;
  }
  return `${hours} цаг ${minutes} минут үлдлээ`;
}
