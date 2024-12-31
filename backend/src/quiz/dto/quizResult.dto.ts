export class QuizResultDto {
    timestamp: string;
    question: string;
    answer: string;

    constructor(timestamp: string, question: string, answer: string) {
        this.timestamp = timestamp;
        this.question = question;
        this.answer = answer;
    }
}
