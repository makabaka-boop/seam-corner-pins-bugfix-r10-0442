const $ = (id) => document.getElementById(id);
let revision = 0,
  result = null;
const invalidate = () => {
  revision++;
  result = null;
  $("download").disabled = true;
  $("evidence").textContent = "输入已改变";
  $("view").replaceChildren();
};
$("mesh").oninput = invalidate;
$("pins").oninput = invalidate;
fetch("/api/samples/plane")
  .then((r) => r.json())
  .then((data) => {
    $("mesh").value = JSON.stringify(data, null, 2);
  });
$("solve").onclick = async () => {
  const current = ++revision;
  result = null;
  $("download").disabled = true;
  try {
    const body = {
      ...JSON.parse($("mesh").value),
      pins: JSON.parse($("pins").value),
    };
    const response = await fetch("/api/pinned", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (current !== revision) return;
    $("evidence").textContent = JSON.stringify(data, null, 2);
    $("view").replaceChildren();
    if (!response.ok || !data.ok) return;
    result = data;
    $("download").disabled = false;
    const xs = data.uv.map((x) => x[0]),
      ys = data.uv.map((x) => x[1]);
    const minX = Math.min(...xs),
      minY = Math.min(...ys),
      scale =
        350 /
        Math.max(1, ...xs.map((x) => x - minX), ...ys.map((y) => y - minY));
    for (const [id, tri] of data.corner_uv.entries()) {
      const polygon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      );
      polygon.setAttribute(
        "points",
        tri
          .map(
            (i) =>
              `${20 + (data.uv[i][0] - minX) * scale},${380 - (data.uv[i][1] - minY) * scale}`,
          )
          .join(" "),
      );
      polygon.setAttribute("fill", "none");
      polygon.setAttribute("stroke", "#146");
      polygon.dataset.face = id;
      $("view").append(polygon);
    }
  } catch (error) {
    if (current === revision) $("evidence").textContent = String(error);
  }
};
$("download").onclick = () => {
  if (!result) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(result)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "pinned-uv.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
