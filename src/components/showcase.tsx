import { ArrowUpRight, MessageCircle, Star } from 'lucide-react'
import { CONTACT } from '@/lib/site-config'
import { REVIEWS, REVIEWS_RATING, REVIEWS_SOURCE_URL, REVIEWS_TOTAL } from '@/lib/reviews-data'
import { WORK_PHOTOS } from '@/lib/works-data'

const photoById = new Map(WORK_PHOTOS.map((photo) => [photo.id, photo]))

// Три направления работ. Описания построены только на том, что видно на снимках,
// и на подтверждённых фактах карточки 2ГИС («Производство», услуги, отзывы).
const CASES: Array<{ title: string; summary: string; points: string[]; photos: number[] }> = [
  {
    title: 'Окна для частного дома',
    summary: 'Белые металлопластиковые окна в кирпичные проёмы: замер, изготовление, монтаж.',
    points: ['Замер по месту', 'Своё производство', 'Аккуратный монтаж'],
    photos: [1, 3, 11],
  },
  {
    title: 'Входные группы и витрины',
    summary: 'Стеклянные входные группы, витражи и витрины для коммерческих объектов.',
    points: ['Алюминиевые и стеклянные конструкции', 'Стеклянные двери', 'Витражи и витрины'],
    photos: [6, 19, 16, 2],
  },
  {
    title: 'Перегородки и панорамное остекление',
    summary: 'Офисные перегородки и остекление больших проёмов.',
    points: ['Стеклянные перегородки', 'Панорамные конструкции', 'Алюминиевый профиль'],
    photos: [15, 13, 18, 5],
  },
]

export function Cases() {
  return (
    <section id="cases" className="border-y border-black/8 bg-[#e9e5dc] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Кейсы</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
          Три направления, с которых чаще всего начинают
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#5c665f]">
          Ниже — реальные кадры с объектов. Если нужен кейс под вашу задачу, покажем примеры и назовём
          параметры по запросу.
        </p>

        <div data-stagger className="mt-8 grid gap-5 lg:grid-cols-3">
          {CASES.map((item) => (
            <article key={item.title} className="flex flex-col overflow-hidden rounded-2xl bg-[#f7f4ee] p-4">
              <div className="grid grid-cols-2 gap-2">
                {item.photos.map((id, index) => {
                  const photo = photoById.get(id)
                  if (!photo) return null
                  return (
                    <img
                      key={photo.id}
                      src={photo.thumb}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className={`w-full rounded-xl object-cover ${index === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'}`}
                    />
                  )
                })}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[#173d35]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5c665f]">{item.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.points.map((point) => (
                  <li key={point} className="rounded-full bg-white px-3 py-1 text-xs text-[#59635d]">
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Отзывы</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
              Что говорят клиенты
            </h2>
            <p className="mt-4 text-base leading-7 text-[#5c665f]">
              {REVIEWS_RATING.toString().replace('.', ',')} из 5 при {REVIEWS_TOTAL} отзывах в 2ГИС.
              Тексты приведены дословно, включая орфографию авторов.
            </p>
          </div>
          <a
            href={REVIEWS_SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#173d35]/20 px-5 text-sm font-medium text-[#173d35] hover:bg-white"
          >
            Читать все отзывы в 2ГИС <ArrowUpRight size={16} />
          </a>
        </div>

        <div data-stagger className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review) => (
            <figure key={`${review.author}-${review.date}`} className="flex flex-col rounded-2xl border border-black/8 bg-white p-5">
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5" aria-label={`Оценка ${review.rating} из 5`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={14} className="fill-[#b18b52] text-[#b18b52]" />
                  ))}
                </span>
                <span className="text-xs text-[#5c665f]">{review.date}</span>
              </div>
              <blockquote className="mt-3 flex-1 whitespace-pre-line text-sm leading-6 text-[#3f4843]">
                {review.text}
              </blockquote>
              <figcaption className="mt-4 border-t border-black/8 pt-3 text-sm font-semibold text-[#173d35]">
                {review.author}
                <span className="ml-2 text-xs font-normal text-[#5c665f]">
                  {review.hasPhoto ? 'отзыв с фото · 2ГИС' : 'отзыв в 2ГИС'}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#e9e5dc] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[#59635d]">
            Хотите поговорить с теми, кому мы уже ставили окна? Напишите — подскажем, что спрашивать.
          </p>
          <a
            href={`https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent('Здравствуйте! Хочу уточнить по работам и отзывам.')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#173d35] px-6 text-sm font-semibold !text-[#f7f4ee] hover:bg-[#24594c]"
          >
            <MessageCircle size={17} /> Написать в WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
