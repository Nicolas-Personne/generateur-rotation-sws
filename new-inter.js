document.addEventListener("DOMContentLoaded", () => {
	const buttonShowForm = document.querySelector("#show-form");
	const formInter = document.querySelector("#form-inter");
	const closeBtn = document.querySelector(".close-icon");
	const overlayPopUp = document.querySelector(".overlay-pop-up");

	buttonShowForm.addEventListener("click", () => {
		!formInter.style.display || formInter.style.display === "none"
			? (formInter.style.display = "flex")
			: (formInter.style.display = "none");
		buttonShowForm.style.pointerEvents = "none";
		overlayPopUp.style.display = "block";
	});
	closeBtn.addEventListener("click", () => {
		console.log(formInter.style.display);
		formInter.reset();
		formInter.style.display === "flex"
			? (formInter.style.display = "none")
			: (formInter.style.display = "flex");
		buttonShowForm.style.pointerEvents = "auto";
		overlayPopUp.style.display = "none";
	});
	formInter.addEventListener("submit", (e) => {
		e.preventDefault();
		const initial = document.querySelector("#initial").value;
		const lastname = document.querySelector("#lastname").value;
		const firstname = document.querySelector("#firstname").value;
		const email = document.querySelector("#email").value;
		const data = {
			[initial]: [lastname, firstname, email],
		};
		let allData = JSON.parse(localStorage.getItem("inter"));
		allData = {
			...allData,
			...data,
		};
		localStorage.setItem("inter", JSON.stringify(allData));
		formInter.reset();
		formInter.style.display === "none"
			? (formInter.style.display = "flex")
			: (formInter.style.display = "none");
		buttonShowForm.style.pointerEvents = "auto";
		overlayPopUp.style.display = "none";
		window.location.href = window.location.href;
	});
});
