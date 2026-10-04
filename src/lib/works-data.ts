// Данные галереи реальных работ.
// Источник: публичная карточка компании в 2ГИС, https://2gis.kz/astana/firm/70000001042561575
// Поле source: 'Официальное' — снимок из блока компании, 'Отзыв' — фотография из отзыва клиента.
export type WorkPhoto = {
  id: number
  full: string
  thumb: string
  width: number
  height: number
  orientation: 'landscape' | 'portrait'
  alt: string
  source: 'Официальное' | 'Отзыв'
}

export const WORK_PHOTOS: WorkPhoto[] = [
  { id: 1, full: '/works/work-01.webp', thumb: '/works/work-01-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Пластиковое окно с открытой створкой в кирпичном доме', source: 'Официальное' },
  { id: 2, full: '/works/work-02.webp', thumb: '/works/work-02-thumb.webp', width: 1200, height: 1600, orientation: 'portrait', alt: 'Входная группа со стеклянными дверями на коммерческом объекте', source: 'Официальное' },
  { id: 3, full: '/works/work-03.webp', thumb: '/works/work-03-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Пластиковое окно, установленное в кирпичном доме', source: 'Отзыв' },
  { id: 4, full: '/works/work-04.webp', thumb: '/works/work-04-thumb.webp', width: 1179, height: 1499, orientation: 'portrait', alt: 'Вид из установленного окна', source: 'Отзыв' },
  { id: 5, full: '/works/work-05.webp', thumb: '/works/work-05-thumb.webp', width: 960, height: 1280, orientation: 'portrait', alt: 'Белое пластиковое окно в интерьере', source: 'Отзыв' },
  { id: 6, full: '/works/work-06.webp', thumb: '/works/work-06-thumb.webp', width: 1200, height: 1600, orientation: 'portrait', alt: 'Входная группа магазина: стеклянные двери и витражи', source: 'Официальное' },
  { id: 7, full: '/works/work-07.webp', thumb: '/works/work-07-thumb.webp', width: 1440, height: 648, orientation: 'landscape', alt: 'Фасад жилого дома после остекления', source: 'Официальное' },
  { id: 8, full: '/works/work-08.webp', thumb: '/works/work-08-thumb.webp', width: 1440, height: 1080, orientation: 'landscape', alt: 'Фасадное остекление коммерческого здания', source: 'Отзыв' },
  { id: 9, full: '/works/work-09.webp', thumb: '/works/work-09-thumb.webp', width: 1440, height: 1080, orientation: 'landscape', alt: 'Жилой дом: остекление балконов и лоджий', source: 'Официальное' },
  { id: 10, full: '/works/work-10.webp', thumb: '/works/work-10-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Окно в интерьере: вид на улицу', source: 'Отзыв' },
  { id: 11, full: '/works/work-11.webp', thumb: '/works/work-11-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Пластиковое окно в кирпичной кладке', source: 'Отзыв' },
  { id: 12, full: '/works/work-12.webp', thumb: '/works/work-12-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Входная дверь в тамбуре', source: 'Официальное' },
  { id: 13, full: '/works/work-13.webp', thumb: '/works/work-13-thumb.webp', width: 1440, height: 810, orientation: 'landscape', alt: 'Тёмная алюминиевая конструкция в интерьере', source: 'Официальное' },
  { id: 14, full: '/works/work-14.webp', thumb: '/works/work-14-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Дверь с остеклением', source: 'Официальное' },
  { id: 15, full: '/works/work-15.webp', thumb: '/works/work-15-thumb.webp', width: 1440, height: 810, orientation: 'landscape', alt: 'Стеклянные офисные перегородки', source: 'Официальное' },
  { id: 16, full: '/works/work-16.webp', thumb: '/works/work-16-thumb.webp', width: 1440, height: 810, orientation: 'landscape', alt: 'Остекление витрин коммерческого объекта', source: 'Официальное' },
  { id: 17, full: '/works/work-17.webp', thumb: '/works/work-17-thumb.webp', width: 1440, height: 810, orientation: 'landscape', alt: 'Остекление строящегося жилого комплекса', source: 'Официальное' },
  { id: 18, full: '/works/work-18.webp', thumb: '/works/work-18-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Панорамное остекление: стеклянная стена в интерьере', source: 'Официальное' },
  { id: 19, full: '/works/work-19.webp', thumb: '/works/work-19-thumb.webp', width: 1440, height: 864, orientation: 'landscape', alt: 'Входная группа с козырьком и остеклением', source: 'Официальное' },
  { id: 20, full: '/works/work-20.webp', thumb: '/works/work-20-thumb.webp', width: 1440, height: 2560, orientation: 'portrait', alt: 'Жилой дом: остеклённые балконы', source: 'Официальное' },
  { id: 21, full: '/works/work-21.webp', thumb: '/works/work-21-thumb.webp', width: 1440, height: 1080, orientation: 'landscape', alt: 'Жилой дом после остекления: фасад', source: 'Официальное' },
  { id: 22, full: '/works/work-22.webp', thumb: '/works/work-22-thumb.webp', width: 1440, height: 2560, orientation: 'portrait', alt: 'Входная группа: стеклянная дверь с деревянной рамой', source: 'Официальное' },
  { id: 23, full: '/works/work-23.webp', thumb: '/works/work-23-thumb.webp', width: 1204, height: 1600, orientation: 'portrait', alt: 'Трёхстворчатое пластиковое окно белого цвета', source: 'Отзыв' },
  { id: 24, full: '/works/work-24.webp', thumb: '/works/work-24-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Дверь в офисном интерьере', source: 'Официальное' },
  { id: 25, full: '/works/work-25.webp', thumb: '/works/work-25-thumb.webp', width: 1440, height: 1920, orientation: 'portrait', alt: 'Алюминиевый профиль в цехе', source: 'Отзыв' },
  { id: 26, full: '/works/work-26.webp', thumb: '/works/work-26-thumb.webp', width: 1440, height: 1912, orientation: 'portrait', alt: 'Входная группа в процессе монтажа', source: 'Отзыв' },
]
