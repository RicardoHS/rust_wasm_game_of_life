build:
	wasm-pack build --release
	cd www
	npm install

run:
	npm run start --prefix www