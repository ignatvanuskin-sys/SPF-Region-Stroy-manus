import { Calculator, ChevronDown, MessageCircle, Ruler, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  CONTACT,
  FITTING_OPTIONS,
  GLAZING_OPTIONS,
  PRICES_APPROVED,
  PROFILE_OPTIONS,
} from '@/lib/site-config'

const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })

export function PriceCalculator({ onOrder }: { onOrder: () => void }) {
  const [units, setUnits] = useState(3)
  const [width, setWidth] = useState(1.2)
  const [height, setHeight] = useState(1.4)
  const [profile, setProfile] = useState<string>(PROFILE_OPTIONS[0].id)
  const [fitting, setFitting] = useState<string>(FITTING_OPTIONS[0].id)
  const [glazing, setGlazing] = useState<string>(GLAZING_OPTIONS[0].id)
  const [installation, setInstallation] = useState(true)

  const result = useMemo(() => {
    const area = Math.max(0.1, units * width * height)
    const profileRate = PROFILE_OPTIONS.find((item) => item.id === profile)?.rate ?? 65000
    const fittingRate = FITTING_OPTIONS.find((item) => item.id === fitting)?.rate ?? 1
    const glazingRate = GLAZING_OPTIONS.find((item) => item.id === glazing)?.rate ?? 1
    const construction = area * profileRate * fittingRate * glazingRate
    const install = installation ? area * 12000 + 10000 : 0
    const total = construction + install
    return { area, min: Math.round(total * 0.88), max: Math.round(total * 1.12) }
  }, [units, width, height, profile, fitting, glazing, installation])

  // Короткий путь «сайт → WhatsApp»: конфигурация уходит менеджеру готовым текстом.
  const whatsappUrl = useMemo(() => {
    const label = (options: ReadonlyArray<{ id: string; label: string }>, id: string) =>
      options.find((item) => item.id === id)?.label ?? id

    const message = [
      'Здравствуйте! Собрал конфигурацию на сайте СПФ Регион Строй:',
      `Окон: ${units}`,
      `Размер: ${width} × ${height} м`,
      `Площадь: ${result.area.toFixed(1)} м²`,
      `Профиль: ${label(PROFILE_OPTIONS, profile)}`,
      `Фурнитура: ${label(FITTING_OPTIONS, fitting)}`,
      `Стеклопакет: ${label(GLAZING_OPTIONS, glazing)}`,
      installation ? 'Нужен монтаж и доставка' : 'Без монтажа',
      'Подскажите, пожалуйста, стоимость.',
    ].join('\n')

    return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
  }, [units, width, height, profile, fitting, glazing, installation, result.area])

  return (
    <section
      id="calculator"
      className="border-y border-black/8 bg-[#173d35] px-5 py-16 text-[#f7f4ee] sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#b18b52] text-[#fffdf9]">
              <Calculator size={23} />
            </div>
            <p className="mt-7 text-xs uppercase tracking-[0.18em] text-[#d4b477]">
              Предварительный расчёт
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Соберите конфигурацию за минуту.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#d9e4dc]/80">
              Выберите профиль, фурнитуру и стеклопакет — менеджер получит вашу конфигурацию вместе с
              заявкой и подготовит расчёт с учётом реальных размеров и монтажа.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#f7f4ee] p-5 text-[#202522] shadow-[0_30px_80px_-35px_rgba(0,0,0,.45)] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="text-sm text-[#59635d]">
                Количество окон
                <input
                  type="number"
                  name="units"
                  min="1"
                  max="30"
                  value={units}
                  onChange={(event) => setUnits(Number(event.target.value) || 1)}
                  className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-[#173d35]"
                />
              </label>
              <label className="text-sm text-[#59635d]">
                Ширина, м
                <input
                  type="number"
                  name="width"
                  min="0.3"
                  max="8"
                  step="0.1"
                  value={width}
                  onChange={(event) => setWidth(Number(event.target.value) || 0.3)}
                  className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-[#173d35]"
                />
              </label>
              <label className="text-sm text-[#59635d]">
                Высота, м
                <input
                  type="number"
                  name="height"
                  min="0.3"
                  max="8"
                  step="0.1"
                  value={height}
                  onChange={(event) => setHeight(Number(event.target.value) || 0.3)}
                  className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-3 font-medium outline-none focus:ring-2 focus:ring-[#173d35]"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <SelectField
                label="Профиль"
                value={profile}
                onChange={setProfile}
                options={PROFILE_OPTIONS.map(({ id, label, note }) => ({
                  id,
                  label: `${label} — ${note}`,
                }))}
              />
              <SelectField
                label="Фурнитура"
                value={fitting}
                onChange={setFitting}
                options={FITTING_OPTIONS.map(({ id, label }) => ({ id, label }))}
              />
              <SelectField
                label="Стеклопакет"
                value={glazing}
                onChange={setGlazing}
                options={GLAZING_OPTIONS.map(({ id, label }) => ({ id, label }))}
              />
            </div>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-black/8 bg-white p-4 text-sm text-[#59635d]">
              <input
                type="checkbox"
                name="installation"
                checked={installation}
                onChange={(event) => setInstallation(event.target.checked)}
                className="size-5 accent-[#173d35]"
              />
              <span className="flex-1">Добавить ориентировочный монтаж и доставку</span>
              <Ruler size={17} className="text-[#b18b52]" />
            </label>

            <div aria-live="polite" className="mt-6 rounded-2xl bg-[#e6eee8] p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-[#66806f]">
                Ваша конфигурация: {result.area.toFixed(1)} м²
              </p>
              {PRICES_APPROVED ? (
                <>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#173d35]">
                    от {money.format(result.min)} до {money.format(result.max)} ₸
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#66716a]">
                    Предварительный ориентир, не является офертой. Точную стоимость менеджер
                    подтвердит после замера.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[#4a5450]">
                  Стоимость рассчитаем после замера: она зависит от размеров, открываний, цвета и
                  монтажа. Отправьте конфигурацию — менеджер подготовит точный расчёт.
                </p>
              )}
            </div>

            {/*
              min-h-12 + w-full вместо h-12 flex-1: внутри flex-col у flex-1 стоит
              flex-basis: 0 в вертикальной оси, и кнопка схлопывалась до 20px.
            */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onOrder}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173d35] px-5 text-sm font-semibold !text-[#f7f4ee] hover:bg-[#24594c] sm:w-auto sm:flex-1"
              >
                Получить точный расчёт <Send size={16} />
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#173d35]/25 px-5 text-sm font-medium text-[#173d35] hover:bg-[#e6eee8] sm:w-auto"
              >
                <MessageCircle size={16} /> Расчёт в WhatsApp
              </a>
            </div>
            <a
              className="mt-4 inline-block text-xs font-medium text-[#173d35] underline underline-offset-4"
              href="#how-it-works"
            >
              Как проходит замер и монтаж
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ id: string; label: string }>
}) {
  return (
    <label className="relative text-sm text-[#59635d]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full appearance-none rounded-xl border border-black/15 bg-white px-3 pr-9 text-sm font-medium text-[#202522] outline-none focus:ring-2 focus:ring-[#173d35]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 bottom-3.5 text-[#66716a]"
      />
    </label>
  )
}
