import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { WORK_PHOTOS } from '@/lib/works-data'

const PREVIEW_COUNT = 10

export function WorksGallery() {
  const [expanded, setExpanded] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const isOpen = openIndex !== null

  const visible = expanded ? WORK_PHOTOS : WORK_PHOTOS.slice(0, PREVIEW_COUNT)
  const active = openIndex === null ? null : WORK_PHOTOS[openIndex]

  // Блокировка прокрутки + возврат фокуса
  useEffect(() => {
    if (!isOpen) return
    lastFocusedRef.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      lastFocusedRef.current?.focus()
    }
  }, [isOpen])

  // Клавиатура: Esc — закрыть, стрелки — листать
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenIndex(null)
      if (event.key === 'ArrowRight') setOpenIndex((current) => (current === null ? current : (current + 1) % WORK_PHOTOS.length))
      if (event.key === 'ArrowLeft') setOpenIndex((current) => (current === null ? current : (current - 1 + WORK_PHOTOS.length) % WORK_PHOTOS.length))

      // Ловушка фокуса: Tab не должен уводить за пределы диалога в контент под ним.
      if (event.key === 'Tab') {
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
        if (!dialog) return
        const focusable = Array.from(
          dialog.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
        ).filter((element) => !element.hasAttribute('disabled'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <section id="works" className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#7a5c2c]">Наши работы</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#173d35] sm:text-4xl">
              Реальные объекты, а не стоковые картинки
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5c665f]">
              Фотографии из карточки компании: окна в домах, входные группы, витражи, офисные перегородки.
              Нажмите на снимок, чтобы рассмотреть детали.
            </p>
          </div>
          <a
            href="https://2gis.kz/astana/gallery/firm/70000001042561575"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#173d35]/20 px-5 text-sm font-medium text-[#173d35] hover:bg-white"
          >
            <Images size={16} /> Все фото в 2ГИС
          </a>
        </div>

        <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4">
          {visible.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Открыть фотографию: ${photo.alt}`}
              className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-black/8 bg-white p-1.5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <img
                src={photo.thumb}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-xl object-cover"
              />
            </button>
          ))}
        </div>

        {!expanded && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#173d35]/20 px-6 text-sm font-semibold text-[#173d35] hover:bg-white"
            >
              Показать все {WORK_PHOTOS.length} работ
            </button>
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-[#5c665f]">
          Фотографии опубликованы в открытой карточке компании в 2ГИС. Часть снимков прислана клиентами
          в отзывах — поэтому кадры без обработки и сняты на телефон.
        </p>
      </div>

      {isOpen && active && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография ${openIndex + 1} из ${WORK_PHOTOS.length}: ${active.alt}`}
          className="fixed inset-0 z-50 flex flex-col bg-[#121714]/95 backdrop-blur-sm"
          onClick={() => setOpenIndex(null)}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-[#f7f4ee] sm:px-6">
            <span className="text-xs tabular-nums text-[#c9cdc9]">
              {openIndex + 1} / {WORK_PHOTOS.length}
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Закрыть просмотр"
              onClick={(event) => {
                event.stopPropagation()
                setOpenIndex(null)
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-2 sm:px-6">
            <img
              src={active.full}
              alt={active.alt}
              onClick={(event) => event.stopPropagation()}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <button
              type="button"
              aria-label="Предыдущая фотография"
              onClick={(event) => {
                event.stopPropagation()
                setOpenIndex((openIndex - 1 + WORK_PHOTOS.length) % WORK_PHOTOS.length)
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#f7f4ee] hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>
            <p className="flex-1 text-center text-xs leading-5 text-[#c9cdc9]">{active.alt}</p>
            <button
              type="button"
              aria-label="Следующая фотография"
              onClick={(event) => {
                event.stopPropagation()
                setOpenIndex((openIndex + 1) % WORK_PHOTOS.length)
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#f7f4ee] hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
