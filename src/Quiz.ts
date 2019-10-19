export default class Quiz {
  private questionSet: null | any[]
  constructor(questionSet: string[]) {
    this.questionSet = questionSet
  }
  getAllQuestions = () => this.questionSet
}
