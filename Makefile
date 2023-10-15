build:
	wasm-pack build --release
	cd www
	npm install

run:
	cd www
	npm run start