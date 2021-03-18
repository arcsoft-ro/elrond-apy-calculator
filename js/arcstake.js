$(document).ready(function () {

	arcstake.netTotalStakeSlider = $("#netTotalStake").slider({
		min: 8000000,
		max: 13000000,
		step: 500000,
		value: 8000000,
		formatter: function (value) {
			return parseInt(value).toLocaleString("en-US");
		}
	});

	arcstake.netTotalStakeSlider.on("change", function () {
		var apyVariables = arcstake.readVariables();
		arcstake.computeAPY(apyVariables);
	});

	arcstake.userStakeSlider = $("#userStake").slider({
		min: 1,
		max: 10000,
		step: 1,
		value: 1000,
		formatter: function (value) {
			return parseInt(value).toLocaleString("en-US");
		}
	});

	arcstake.userStakeSlider.on("change", function () {
		$("#userStakeVal").val($(this).val());
		var apyVariables = arcstake.readVariables();
		arcstake.computeAPY(apyVariables);
	});

	$("#userStakeVal").change(function () {
		$("#userStake").slider("setValue", $(this).val(), true);
		var apyVariables = arcstake.readVariables();
		arcstake.computeAPY(apyVariables);
	});

	arcstake.intToLocaleEgld("#netTotalStake", "#netTotalStakeVal");
	$("#userStakeVal").val($("#userStake").val());

	var apyVariables = arcstake.readVariables();
	arcstake.computeAPY(apyVariables);

	$(".apy-variable").change(function () {
		arcstake.intToLocaleEgld("#netTotalStake", "#netTotalStakeVal");
		arcstake.intToLocaleEgld("#userStake", "#userStakeVal")
		var apyVariables = arcstake.readVariables();
		arcstake.computeAPY(apyVariables);
	});

});

var arcstake = {

	computeAPY: function (apyVariables) {
		var rewardsPerEpoch = (arcstake.const.genesisTokenSupply * arcstake.const.inflation[0]) / 365;
		var rewardsPerEpochWithoutProtocolSustainability = (1 - arcstake.const.protocolSustainability) * rewardsPerEpoch;
		var topupRewardsLimit = arcstake.const.topUpFactor * rewardsPerEpochWithoutProtocolSustainability;
		var networkBaseStake = arcstake.const.numNodes * arcstake.const.stakePerNode;
		var networkTopupStake = apyVariables.netTotalStake - networkBaseStake;

		var networkTopupRewards = 0;
		if (networkTopupStake != 0) {
			networkTopupRewards = ((2 * topupRewardsLimit) / Math.PI) * Math.atan(networkTopupStake / arcstake.const.topUpGradient);
		}

		var networkBaseRewards = rewardsPerEpochWithoutProtocolSustainability - networkTopupRewards;
		var spTotalStake = apyVariables.agencyBaseStake + apyVariables.agencyTopupStake;
		var spBaseRewards = (apyVariables.agencyBaseStake / networkBaseStake) * networkBaseRewards;

		var spTopupRewards = 0;
		if (networkTopupRewards != 0) {
			spTopupRewards = (apyVariables.agencyTopupStake / networkTopupStake) * networkTopupRewards;
		}

		var spAPY = (365 * (spBaseRewards + spTopupRewards)) / spTotalStake;
		var delegatorApy = spAPY - (apyVariables.agencyFee * spAPY);

		var delegatorYearly = delegatorApy * apyVariables.userStake;
		var delegatorDaily = delegatorYearly / 365;
		var delegatorWeekly = delegatorDaily * 7;
		var delegatorMonthly = delegatorDaily * 30;

		$("#agency-apy").text((spAPY * 100).toFixed(2) + "%");
		$("#delegator-apy").text((delegatorApy * 100).toFixed(2) + "%");

		$("#yearly-rewards").text(delegatorYearly.toFixed(2));
		$("#monthly-rewards").text(delegatorMonthly.toFixed(3));
		$("#weekly-rewards").text(delegatorWeekly.toFixed(4));
		$("#daily-rewards").text(delegatorDaily.toFixed(4));
	},

	readVariables: function () {
		var netTotalStake = parseInt($("#netTotalStake").val());
		var userStake = parseInt($("#userStake").val());
		var agencyBaseStake = parseInt($("#agencyBaseStake").val());
		var agencyTopupStake = parseInt($("#agencyTopupStake").val());
		var agencyFee = parseFloat($("#agencyFee").val()) / 100;

		return {
			netTotalStake: netTotalStake,
			userStake: userStake,
			agencyBaseStake: agencyBaseStake,
			agencyTopupStake: agencyTopupStake,
			agencyFee: agencyFee
		};
	},

	intToLocaleEgld: function (inputId, labelId) {
		var inputValue = $(inputId).val();
		$(labelId).text(parseInt(inputValue).toLocaleString("en-US") + arcstake.const.egld);
	},

	currentEpoch: 1,

	config: {
		apiBaseUrl: "https://elrond.api.arcstake.com",
	},

	const: {
		egld: " eGLD",
		stakePerNode: 2500,
		protocolSustainability: 0.1,
		numNodes: 3200,
		topUpFactor: 0.25,
		topUpGradient: 3000000,
		genesisTokenSupply: 20000000,
		inflation: [
			0.10845130,
			0.09703538,
			0.08561945,
			0.07420352,
			0.06278760,
			0.05137167,
			0.03995574,
			0.02853982,
			0.01712389,
			0.00570796
		]
	}

};
