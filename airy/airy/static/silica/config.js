const templateAfLevel = document.getElementById("template-af-level");

function syncLevel(node) {
  return (event) => {
    node.dataset.reqlevel = event.currentTarget.value;
  };
}

for (let node of document.getElementsByClassName("ap-af")) {
  const checkbox = node.getElementsByClassName("checkbox")[0];
  const level = node.getElementsByClassName("level")[0];
  if (level) {
    level.addEventListener("change", syncLevel(node));
  }
  checkbox.addEventListener("change", (event) => {
    const level = node.getElementsByClassName("level")[0];
    if (event.currentTarget.checked) {
      // TODO: maybe hide the checkbox when un-clicked?
      if (level) return;
      const clone = templateAfLevel.content.cloneNode(true);
      const cLevel = clone.querySelector(".level");
      cLevel.name = `ap/${node.dataset.apId}/reqlevel/${node.dataset.afId}`;
      cLevel.value = `${node.dataset.reqlevel}`;
      cLevel.addEventListener("change", syncLevel(node));
      node.appendChild(clone);
    } else {
      level.remove();
    }
  });
}
