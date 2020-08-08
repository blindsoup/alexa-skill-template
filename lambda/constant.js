/**
 * スキル名とスキルの説明、ヘルプメッセージ
 * @type {String}
 */
const skill_name = 'シンプルクイズ';
const skill_description = 'スマートスピーカーに関するクイズを出題します。'; 
const help_message = 'このスキルでは、スマートスピーカーに関するクイズを遊ぶことができます。クイズが出題されますので、正解だと思う番号を言ってくださいね。';

/**
 * クイズの問題と回答を定義
 *     'q':問題文，'a': 正解の選択肢の番号
 * @type {Object}
 */
const questions = [
	{'q': '日本でのスマートスピーカー普及率はどのくらい？１、6%。２、15%。３、30%。', 'a':1},
	{'q': 'アメリカでのスマートスピーカー普及率はどのくらい？１、10%。２、26%。３、34%。', 'a':2},
	{'q': 'アマゾンエコーのコンパクトモデル、エコードットは、いくらくらいで購入できるでしょうか。１、３０００円。２、６０００円。３、１００００円。', 'a': 2},
	{'q': '次のうち、スマートスピーカーを販売していない企業はどれ？１、アマゾン。２、フェースブック。３、ツイッター。４、グーグル。', 'a':3},
	{'q': 'アマゾンエコーなどでつかえる拡張機能（スキル）は、全世界で個人や企業が開発して公開しています。世界全体では、どのくらいのスキルがあるのでしょうか。１、９０００。２、５００００。３、９００００。', 'a':3},
	{'q': 'スマートスピーカー、アマゾンエコーが日本で販売開始されたのはいつでしょうか。１、2016年１１月。２、２０１７年１１月。３、２０１８年４月', 'a': 2}
];

/**
 * 配列をシャッフルする
 * @param {Object} arr 配列
 * @return {Void}
 */
function shuffle(arr){
	// 以下のコメントアウトを外すと、問題がシャッフルされます
	/*
	for(let i = arr.length - 1; i > 0; i--){
		let r = Math.floor(Math.random() * (i + 1));
		let tmp = arr[i];
		arr[i] = arr[r];
		arr[r] = tmp;
	}
	*/
}

exports.skill_name = skill_name;
exports.skill_description = skill_description;
exports.help_message = help_message;
exports.questions = questions;
exports.shuffle = shuffle;