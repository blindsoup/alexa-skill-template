const Alexa = require('ask-sdk-core');
const c = require('./constant.js');

/**
 * 効果音ファイルのS3のディレクトリまでのパス。
 * @type {String}
 */
const url = 'https://s3-ap-northeast-1.amazonaws.com/ntut-alexa-library/getupskill/';

/**
 * 効果音の一覧。
 * @type {Object}
 */
const effects = {
	'select': "<audio src='" + url + 'select.mp3' + "'/>",
	'cancel': "<audio src='" + url + 'cancel.mp3' + "'/>",
	'good': "<audio src='" + url + 'correct2.mp3' + "'/>",
	'bad': "<audio src='" + url + 'incorrect1.mp3' + "'/>",
	'question': "<audio src='" + url + 'question1.mp3' + "'/>",
};


/**
 * スキルが起動した直後の処理
 *     １問目のクイズを出題する。
 */
const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	handle(handlerInput) {
		// Welcome message
		let speechText = `ようこそ、${c.skill_name}へ。今から、${c.skill_description}それでは、スタート！`;
		let attr = handlerInput.attributesManager.getSessionAttributes();
		init(attr);
		speechText += getQuestion(attr);
		handlerInput.attributesManager.setSessionAttributes(attr);

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	},
};

/**
 * クイズの処理
 *		 正解なら次の問題を出題し、不正解なら再び回答を求める
 */
const QuizIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'QuizIntent';
	},
	handle(handlerInput) {
		let output = '';
		const reprompt = '答えは？';
		let attr = handlerInput.attributesManager.getSessionAttributes();
		
		// ユーザの答え（選択しの番号を取得）
		const answer = handlerInput.requestEnvelope.request.intent.slots.answer.value;
		// 数字でなければ
		if(isNaN(answer)){
			output += '正解だと思う選択肢の番号を教えてね。';
		}
		// 数字を認識した場合は
		else{
			output += checkAnswer(attr, answer);
		}
		handlerInput.attributesManager.setSessionAttributes(attr);
		// クイズの問題がつきたら
		if(attr.flag) return handlerInput.responseBuilder.speak(output).getResponse();

		
		return handlerInput.responseBuilder
			.speak(output)
			.reprompt(reprompt)
			.getResponse();
	},
};

const RepeatIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
	},
	handle(handlerInput) {
		let attr = handlerInput.attributesManager.getSessionAttributes();
		let output = c.questions[attr.index]['q'];
		let reprompt = '答えは？';
		return handlerInput.responseBuilder
			.speak(output)
			.reprompt(reprompt)
			.getResponse();
	},
};


const HelpIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speechText = c.help_message;

		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.withSimpleCard('Hello World', speechText)
			.getResponse();
	},
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
				|| handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speechText = 'また遊んでね。';

		return handlerInput.responseBuilder
			.speak(speechText)
			.withSimpleCard('Hello World', speechText)
			.getResponse();
	},
};

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

		return handlerInput.responseBuilder.getResponse();
	},
};

const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${error.message}`);

		return handlerInput.responseBuilder
			.speak('聞き取れませんでした。もう一回言ってください。')
			.reprompt('Sorry, I can\'t understand the command. Please say again.')
			.getResponse();
	},
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
	.addRequestHandlers(
		LaunchRequestHandler,
		QuizIntentHandler,
		RepeatIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler
	)
	.addErrorHandlers(ErrorHandler)
	.lambda();

// function

/**
 * 問題選定
 *     問題文を選択し、応答を作成
 * @param {Object} attribute セッション配列
 * @return {String} 質問文の応答テキスト
 */
function getQuestion(attr){
	let responseText = '';
	if(attr.indexes.length){
		attr.index = attr.indexes[0];
		attr.indexes.shift();
		attr.cnt += 1;
		responseText += '第' + attr.cnt + '問。' + effects.question + c.questions[attr.index]['q'] + '<break time="0.5s"/>答えをどうぞ。';
	}
	else{
		attr.flag = true;
		responseText += 'お疲れさまでした。これでクイズは終了です。また遊んでね。';
	}
	return responseText;
}

/**
 * 問題が正解なのか間違いなのか判定する。
 *     正解であれば次の問題を出題する。
 * @param {Object} attr セッション配列
 * @param {Number} answer 答えの選択肢番号
 * @return {String} 応答テキスト
 */
function checkAnswer(attr, answer){
	// 正解ならば
	const a = c.questions[attr.index]['a'];
	let responseText = '';
	if(answer == a){
		responseText += effects.good;
		responseText += getQuestion(attr);
	}
	// 間違いならば
	else{
		responseText += effects.bad + '残念。もう一度考えよう。答えは？';
	}
	return responseText;
}

/**
 * セッション情報初期化処理
 *     質問を順番に出題するためのインデックスを定義
 * @param {Object} attribute セッション配列
 * @return {Void}
 */
function init(attr){
	let arr = [];
	for(let i=0; i<c.questions.length; i++){
		arr.push(i);
	}
	c.shuffle(arr);
	attr.indexes = arr;
	attr.cnt = 0;
}