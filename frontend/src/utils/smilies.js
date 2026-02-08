// Смайлы в стиле 2010-х (Facebook, VK, ICQ)

export const SMILEYS = [
  { code: ':)', img: '😊', label: 'Улыбка' },
  { code: ':(', img: '😞', label: 'Грусть' },
  { code: ':D', img: '😀', label: 'Смех' },
  { code: ';)', img: '😉', label: 'Подмигивание' },
  { code: ':P', img: '😛', label: 'Язык' },
  { code: ':O', img: '😮', label: 'Удивление' },
  { code: ':*', img: '😘', label: 'Поцелуй' },
  { code: 'B)', img: '😎', label: 'Крутой' },
  { code: '>:)', img: '😈', label: 'Чертёнок' },
  { code: ':\'(', img: '😢', label: 'Плач' },
  { code: ':\'D', img: '😂', label: 'Смех до слёз' },
  { code: 'xD', img: '😆', label: 'Ржу' },
  { code: '<3', img: '❤️', label: 'Сердце' },
  { code: ':3', img: '😺', label: 'Котик' },
  { code: '^_^', img: '😊', label: 'Радость' },
  { code: 'O_o', img: '🤨', label: 'Что?' },
  { code: '-_-', img: '😑', label: 'Без эмоций' },
  { code: '=(', img: '😥', label: 'Расстроен' },
  { code: ':-*', img: '😗', label: 'Чмок' },
];

export function parseSmilies(text) {
  if (!text) return '';
  let result = text;
  for (const s of SMILEYS) {
    result = result.split(s.code).join(s.img);
  }
  return result;
}
