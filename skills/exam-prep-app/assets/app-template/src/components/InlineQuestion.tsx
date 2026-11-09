import { useState } from 'react'
import type { Question } from '../lib/types.ts'
import { emptyAnswer, isAnswerComplete, scoreQuestion, type Answer } from '../lib/scoring.ts'
import { store, useProgress } from '../lib/store.ts'
import { caseById } from '../content/index.ts'
import { Explanation, QuestionView } from './QuestionView.tsx'
import { Icon } from './Icon.tsx'
import { useT } from '../i18n/index.ts'

/** Self-contained question with check + feedback, used for the lesson mini-quiz. */
export function InlineQuestion({ q, seed }: { q: Question; seed: number }) {
  const { lang } = useProgress()
  const t = useT()
  const [answer, setAnswer] = useState<Answer>(() => emptyAnswer(q))
  const [revealed, setRevealed] = useState(false)
  const result = revealed ? scoreQuestion(q, answer) : null

  const check = () => {
    const r = scoreQuestion(q, answer)
    store.recordAnswer(q.id, r.score)
    setRevealed(true)
  }

  return (
    <article className={`inline-q${result ? (result.correct ? ' is-correct' : ' is-wrong') : ''}`}>
      <QuestionView question={q} lang={lang} answer={answer} onChange={setAnswer} revealed={revealed} seed={seed} caseStudy={q.caseId ? caseById.get(q.caseId) : undefined} />
      {!revealed ? (
        <div className="inline-q__bar">
          <button type="button" className="btn btn--primary" disabled={!isAnswerComplete(q, answer)} onClick={check}>
            {t.common.check}
          </button>
        </div>
      ) : (
        <div className={`feedback-banner ${result!.correct ? 'is-correct' : 'is-wrong'}`} role="status">
          <p className="feedback-banner__title">
            <Icon name={result!.correct ? 'checkCircle' : 'dismissCircle'} size={22} />
            {result!.correct ? t.common.correct : result!.score > 0 ? t.common.partly : t.common.notQuite}
          </p>
          <Explanation q={q} lang={lang} answer={answer} />
        </div>
      )}
    </article>
  )
}
