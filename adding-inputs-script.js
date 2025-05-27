document.addEventListener("DOMContentLoaded", () => {
	const buttonAddInputs = document.querySelector(".add-sheet");
	const sheetsContainer = document.querySelector("#sheets");
	buttonAddInputs.addEventListener("click", () => {
		let button = document.createElement("button");
		button.classList.add("danger");
		button.innerHTML = "-";
		button.addEventListener("click", (e) => {
			e.preventDefault();
			e.target.parentNode.remove();
		});
		let div = document.createElement("div");
		div.classList.add("form-control-child");
		let input = document.createElement("input");
		input.type = "text";
		input.name = "sheets[]";
		input.placeholder = "Ex: 'B3 DATA'";

		div.appendChild(input);
		div.appendChild(button);
		sheetsContainer.appendChild(div);
	});
});
