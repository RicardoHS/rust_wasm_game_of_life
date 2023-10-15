build:
	wasm-pack build --release
	npm install --prefix www

run:
	npm run start --prefix www