(() => {
	const button = document.getElementById("copy-email");

	function conclude(success) {
		button.classList.remove("is-loading");
		button.dataset.state = success;
		setTimeout(() => {
			delete button.dataset.state;
		}, 1500);
	}
	button.onclick = () => {
		button.classList.add("is-loading");

		const email = document.getElementById("obscured-email");
		const sanitized = email.textContent.replace(/\d/g, "");

		navigator.clipboard.writeText(sanitized).then(
			() => conclude(true),
			() => conclude(false)
		);
	};
})();
