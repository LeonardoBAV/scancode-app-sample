const path = require("path");
const webpack = require("webpack");
const nsWebpack = require("@nativescript/webpack");

module.exports = (env) => {
	const envFile = `.env.${env.appEnv || "development"}`;
	require("dotenv").config({ path: path.resolve(__dirname, envFile) });
	nsWebpack.init(env);

	nsWebpack.chainWebpack((config) => {
		config.plugin("define-ns-env").use(webpack.DefinePlugin, [
			{
				"process.env.NS_CURRENT_ENV": JSON.stringify(
					process.env.NS_CURRENT_ENV ?? "development",
				),
				"process.env.SCANCODE_API_URL": JSON.stringify(
					process.env.SCANCODE_API_URL ?? "",
				),
			},
		]);
	});

	return nsWebpack.resolveConfig();
};
