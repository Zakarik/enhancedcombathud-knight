const ModuleName = "enhancedcombathud-knight";

function generateAskHTML(data=[]) {
	let html = '';

	for(let d of data) {
		html += `<label class='${d.type}'>`;
		html += `<span>${d.label}</span>`

		switch(d.type) {
			case 'number':
				html += `
					<input type="number"
					name="${d.name}"
					min="${d.min}"
					value="${d?.value ?? 0}"
					max="${d.max}"
					${d?.autofocus ? 'autofocus' : ''}
					>
				`;
				break;

			case 'select':
				html += `
					<select name="${d.name}">
				`;

				for(let l of d.list) {
					html += `<option value="${l.value}" ${l.value === d.value ? 'selected' : ''}>${l.label}</option>`;
				}

				html += `</select>`
				break;
		}

		html += `</label>`;
	}

	return html;
}

function typeIsActivated(data, roles, limite) {
	if (!Array.isArray(roles)) throw new TypeError('roles doit être un tableau');
	const nLimite = Number(limite);
	if (!Number.isFinite(nLimite)) throw new TypeError('limite doit être un nombre');

	const count = roles.reduce((acc, role) => {
	  const t = data?.type?.[role];
	  const actif = Boolean(t?.conflit) || Boolean(t?.horsconflit);
	  return acc + (actif ? 1 : 0);
	}, 0);

	return count < nLimite;
}

export { ModuleName, generateAskHTML, typeIsActivated }