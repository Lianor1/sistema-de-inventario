
const points = [10, 50, 30, 80, 20];
// code to generate bezier path
function getPath(data, max, width, height) {
    if (data.length === 0) return '';
    const dx = width / (data.length - 1);
    const scaleY = h => height - (h / max) * height;
    
    let path = \M 0 \\;
    for(let i=0; i<data.length-1; i++) {
        const x1 = i * dx;
        const y1 = scaleY(data[i]);
        const x2 = (i+1) * dx;
        const y2 = scaleY(data[i+1]);
        const mx = (x1 + x2) / 2;
        path += \ C \ \, \ \, \ \\;
    }
    return path;
}
console.log(getPath(points, 100, 1000, 200));

