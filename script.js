document.addEventListener("DOMContentLoaded", () => {
	let sheetToCheck = [];
	let arrayOfJson = [];
	const form = document.querySelector("form");
	const monthSelector = document.querySelector("#monthSelector");
	const file = document.querySelector("input[type='file']");
	const sheetsContainer = document.querySelector("#sheets");

	file.addEventListener("change", (e) => {
		const uploadedFile = file.files[0];
		const reader = new FileReader();
		reader.onload = function (e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: "array" });

			const firstSheetName = workbook.SheetNames;
			firstSheetName.map((sheet) => {
				const firstLetter = sheet.split("")[0].toLowerCase();
				if (firstLetter === "m" || firstLetter === "b") {
					const div = document.createElement("div");
					const input = document.createElement("input");
					input.type = "checkbox";
					input.name = "sheets[]";
					input.value = sheet;
					input.id = sheet;
					const label = document.createElement("label");
					label.innerText = sheet;
					label.htmlFor = sheet;
					div.appendChild(input);
					div.appendChild(label);
					sheetsContainer.appendChild(div);
				}
			});
		};
		reader.readAsArrayBuffer(uploadedFile);
	});

	const arrayIntervenants = {
		ACA: ["CAMARA", "Amadou", "amadou.camara@novei.fr"],
		CMA: ["MAMES", "Christophe", "christophe.mames@novei.fr"],
		CLE: ["LENTE", "Chloé", "chloe.lente@novei.fr"],
		CPA: ["PAQUET", "Chloé", "chloe.paquet@novei.fr"],
		FMA: ["MARTIN", "Florian", "florian.martin@novei.fr"],
		NTR: ["TRETOUT", "Nicolas", "nicolas.tretout@novei.fr"],
		NPE: ["PERSONNE", "Nicolas", "nicolas.personne@novei.fr"],
		CMI: ["Chargé", "Missions", ""],
		EKO: ["KOUMBA", "Edwin", "edwin.koumba@novei.fr"],
		ATO: ["TOUTAIN", "Abigaëlle", "abigaelle.toutain@novei.fr"],
	};

	const getName = (initiales) => {
		const key = initiales || "";
		// console.log(key);

		if (arrayIntervenants[key]) {
			return {
				firstname: arrayIntervenants[key][1],
				lastname: arrayIntervenants[key][0],
				email: arrayIntervenants[key][2],
			};
		}
		// Si on ne trouve pas, on retourne les initiales comme lastname
		return {
			firstname: "",
			lastname: key,
			email: "",
		};
	};
	const excelDateToJSDate = (serial) => {
		const utc_days = Math.floor(serial - 25569); // jours entre 1900-01-01 et 1970-01-01;
		const utc_value = utc_days * 86400; //seconds
		return new Date(utc_value * 1000); //ms
	};

	const getWeekNumber = (date) => {
		const d = new Date(
			Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
		);
		const dayNum = d.getUTCDay() || 7;
		d.setUTCDate(d.getUTCDate() + 4 - dayNum);
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
		return weekNo;
	};

	const formatDate = (date) => {
		const dayFormatted = excelDateToJSDate(date);
		const day = `${
			dayFormatted.getDate() < 10 ? "0" : ""
		}${dayFormatted.getDate()}`;
		const month = `${dayFormatted.getMonth() + 1 < 10 ? "0" : ""}${
			dayFormatted.getMonth() + 1
		}`;
		const year = dayFormatted.getFullYear();
		return day + "/" + month + "/" + year;
	};

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const sheets = document.querySelectorAll("input[name='sheets[]'");
		for (i = 0; i < sheets.length; i++) {
			if (sheets[i].checked) {
				sheetToCheck.push(sheets[i].value);
			}
		}
		const uploadedFile = file.files[0];
		const monthSelected = monthSelector.value;
		if (sheetToCheck.length === 0) {
			alert("Veuillez indiquer au moins une feuille");
			return;
		}
		const reader = new FileReader();
		reader.onload = function (e) {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: "array" });

			const firstSheetName = workbook.SheetNames;
			firstSheetName.map((sheet) => {
				if (sheetToCheck.includes(sheet)) {
					let worksheet = workbook.Sheets[sheet];
					let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
					arrayOfJson[sheet] = jsonData;
				}
			});
			processData(monthSelected);
		};
		reader.readAsArrayBuffer(uploadedFile);
	});

	const processData = (selectedMonth) => {
		const allExportRows = [];

		sheetToCheck.forEach((sheet) => {
			const data = arrayOfJson[sheet];
			// console.log(data);

			for (let i = 0; i < data.length; i++) {
				if (data[i][0] === "Mois") {
					// console.log(data[i + 2]);

					const block = {
						month: data[i],
						day: data[i + 1],
						intervenantAM: data[i + 2],
						coursesAM: data[i + 3],
						coursesPM: data[i + 4],
						intervenantPM: data[i + 5],
						promo: sheet,
					};

					const numberOfDays = block.day.length;
					for (let col = 1; col < numberOfDays; col++) {
						if (!block.day[col]) continue;

						const jsDate = excelDateToJSDate(block.day[col]);
						const monthNumber = jsDate.getMonth() + 1; // JS: 0 = janvier

						// Si l'utilisateur a choisi un mois, on filtre
						if (
							!isNaN(selectedMonth) &&
							monthNumber !== Number(selectedMonth)
						) {
							continue;
						}

						const monthStr = jsDate.toLocaleString("fr-FR", { month: "long" });
						const yearStr = jsDate.getFullYear();
						const weekNumber = getWeekNumber(jsDate);

						// Ligne AM
						allExportRows.push({
							"MOIS DE LA ROTATION": `Semaine N°${weekNumber} - ${monthStr}-${yearStr}`,
							"NOM DU COURS": block.coursesAM[col] || "",
							DATE: formatDate(block.day[col]),
							HORAIRE: "9h00 à 12h30",
							"COURS MUTUALISE": "",
							"PROMO(S) CONCERNEE(S) SUR LE CAMPUS": block.promo,
							"SI COURS MUTUALISE AVEC D'AUTRES CAMPUS PRECISER AVEC QUELLE(S) AUTRE(S) PROMO":
								"",
							"CAMPUS OU SE TROUVE L'ENSEIGNANT": "",
							"NOM DE L'ENSEIGNANT": getName(block.intervenantPM[col]).lastname,
							"PRENOM DE L'ENSEIGNANT": getName(block.intervenantPM[col])
								.firstname,
							"ADRESSE MAIL DE L'ENSEIGNANT": getName(block.intervenantPM[col])
								.email,
						});

						// Ligne PM
						allExportRows.push({
							"MOIS DE LA ROTATION": `Semaine N°${weekNumber} - ${monthStr}-${yearStr}`,
							"NOM DU COURS": block.coursesPM[col] || "",
							DATE: formatDate(block.day[col]),
							HORAIRE: "13h30 à 17h00",
							"COURS MUTUALISE": "",
							"PROMO(S) CONCERNEE(S) SUR LE CAMPUS": block.promo,
							"SI COURS MUTUALISE AVEC D'AUTRES CAMPUS PRECISER AVEC QUELLE(S) AUTRE(S) PROMO":
								"",
							"CAMPUS OU SE TROUVE L'ENSEIGNANT": "",
							"NOM DE L'ENSEIGNANT": getName(block.intervenantPM[col]).lastname,
							"PRENOM DE L'ENSEIGNANT": getName(block.intervenantPM[col])
								.firstname,
							"ADRESSE MAIL DE L'ENSEIGNANT": getName(block.intervenantPM[col])
								.email,
						});
					}
					i += 5;
				}
			}
		});
		if (allExportRows.length === 0) {
			alert("Aucune donnée trouvée pour le mois sélectionné.");
			return;
		}
		exportDataToExcel(allExportRows);
	};

	const exportDataToExcel = (rows) => {
		const workbook = XLSX.utils.book_new();

		// Grouper les lignes par promo (niveau)
		const groupedByPromo = rows.reduce((acc, row) => {
			const promo = row["PROMO(S) CONCERNEE(S) SUR LE CAMPUS"];
			if (!acc[promo]) acc[promo] = [];
			acc[promo].push(row);
			return acc;
		}, {});

		Object.entries(groupedByPromo).forEach(([promo, data]) => {
			const worksheet = XLSX.utils.json_to_sheet(data);
			XLSX.utils.book_append_sheet(workbook, worksheet, promo);
		});

		XLSX.writeFile(workbook, "export-planning.xlsx");
	};
});
