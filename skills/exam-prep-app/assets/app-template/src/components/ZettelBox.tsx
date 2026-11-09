import { Icon } from './Icon.tsx'
import { FAECHER, type Fach } from '../lib/zettel.ts'
import { useT } from '../i18n/index.ts'

interface ZettelBoxProps {
  /** Cards per compartment (stage): [1, 2, 3]. */
  counts: readonly [number, number, number]
  /** `full` also draws the rule: forward on a known card, back to compartment 1 on a miss. */
  variant?: 'full' | 'compact'
  /** Compartment that just received a card; it flashes once. */
  receiving?: Fach | null
  /** Changes on every arrival so the flash can replay in the same compartment. */
  pulseKey?: number
  className?: string
}

/**
 * The Leitner box: three compartments (stages) from the back (stage 1, where every card starts) to the front
 * (stage 3, the goal). Each compartment shows its cards as a stack; the stack grows with the square
 * root of the count, so a handful of cards stays visible next to hundreds. The numbers are exact.
 */
export function ZettelBox({ counts, variant = 'full', receiving = null, pulseKey = 0, className }: ZettelBoxProps) {
  const t = useT()
  const max = Math.max(1, ...counts)
  const total = counts[0] + counts[1] + counts[2]
  return (
    <figure className={`zbox zbox--${variant}${className ? ` ${className}` : ''}`}>
      {variant === 'full' && (
        <figcaption className="zbox__rule zbox__rule--forward">
          <strong>{t.box.right}</strong>
          {t.box.rightRule}
          <Icon name="arrowRight" size={16} />
        </figcaption>
      )}
      <p className="zbox__axis" aria-hidden="true">
        <span>{t.box.back}</span>
        <span>{t.box.front}</span>
      </p>
      <ol className="zbox__tray" aria-label={t.box.label(total)}>
        {FAECHER.map((f) => {
          const n = counts[f - 1]
          return (
            <li key={f} className={`zbox__fach zbox__fach--${f}`} data-fach={f}>
              {receiving === f && <span className="zbox__flash" key={`flash-${pulseKey}`} aria-hidden="true" />}
              <span className="zbox__name">{t.cards.stage(f)}</span>
              <span className="zbox__count" key={receiving === f ? `count-${pulseKey}` : 'count'}>
                {n}
                <span className="sr-only">{t.box.cardsSr(f)}</span>
              </span>
              <span className="zbox__stack" aria-hidden="true">
                {n > 0 ? <span className="zbox__cards" style={{ height: `${Math.max(8, Math.sqrt(n / max) * 100)}%` }} /> : <span className="zbox__empty">{t.box.empty}</span>}
              </span>
              {f < 3 && (
                <span className="zbox__next" aria-hidden="true">
                  <Icon name="arrowRight" size={14} />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {variant === 'full' && (
        <div className="zbox__return">
          <span className="zbox__return-line" aria-hidden="true" />
          <p className="zbox__rule zbox__rule--back">
            <strong>{t.box.wrong}</strong>
            {t.box.wrongRule}
          </p>
        </div>
      )}
    </figure>
  )
}
