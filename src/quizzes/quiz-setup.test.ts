import { createEquationQuizzesFromConfig } from "./quiz-setup"
import { quizConfig } from "./quiz-config"
import Quiz from "./Quiz"

describe("createEquationQuizzesFromConfig", () => {
  const listeners = {}
  const equationQuizzes = createEquationQuizzesFromConfig(quizConfig, listeners)

  it("generates quiz for each config", () => {
    expect(equationQuizzes).toHaveLength(quizConfig.length)
    equationQuizzes.map(quiz => expect(quiz).toBeInstanceOf(Quiz))
  })

  it("each quiz has method that returns quiz id", () => {
    equationQuizzes.map((quiz, i) =>
      expect(quiz.getName()).toBe(quizConfig[i].id)
    )
  })
})
