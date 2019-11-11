import axios from "axios"
import { Z_FILTERED } from "zlib"

const QUIZ_API_URL = {
  production: "https://quizz-service.herokuapp.com/api/",
  dev: "http://localhost:3000/api/"
}

const PATH_TO_QUIZZES = "v1/quizzes"

export const fetchData = () => {
  axios
    .get(`${QUIZ_API_URL.dev}${PATH_TO_QUIZZES}`)
    .then(data => console.log(data))
}

const formatQuizData = allQuizzes =>
  allQuizzes.flat().map(q => ({
    name: q.getParentQuizName(),
    question: q.getAsString(),
    submitted_answers: q.getSubmittedAnswersAsString(),
    correct_answers: q.getCorrectAnswersAsString(),
    correct_answers_count: q.getCorrectAnswersCount()
  }))

//next - create question model w and relate question quizparentname with quiz endpoint ???

export const submitQuizzes = allQuizzes => {
  //   console.log("allQuizzes", JSON.stringify(allQuizzes))
  const postData = { name: allQuizzes[0].name, questions: "sokdnf" }

  const formattedData = formatQuizData(allQuizzes)
  console.log("formattedData", formattedData)
  axios
    .post(`${QUIZ_API_URL.dev}${PATH_TO_QUIZZES}`, postData)
    .then(res => console.log(res))
    .catch(err => console.log(err))
}
