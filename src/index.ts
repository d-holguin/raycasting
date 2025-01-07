class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    add(that: Vector2): Vector2 {
        return new Vector2(this.x + that.x, this.y + that.y);
    }
    sub(that: Vector2): Vector2 {
        return new Vector2(this.x - that.x, this.y - that.y);
    }
    div(that: Vector2): Vector2 {
        return new Vector2(this.x / that.x, this.y / that.y);
    }
    mul(that: Vector2): Vector2 {
        return new Vector2(this.x * that.x, this.y * that.y);
    }

    norm(): Vector2 {
        const l = this.length();
        if (l === 0) {
            return new Vector2(0, 0);
        }
        return new Vector2(this.x / l, this.y / l);
    }
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    scale(value: number): Vector2 {
        return new Vector2(this.x * value, this.y * value);
    }
    distanceTo(that: Vector2): number {
        return this.sub(that).length();
    }
    array(): [number, number] {
        return [this.x, this.y];
    }
}

const GRID_ROWS = 10;
const GRID_COLS = 10;
const GRID_SIZE = new Vector2(GRID_COLS, GRID_ROWS);

function fillCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number) {
    ctx.beginPath();
    ctx.arc(...center.array(), radius, 0, 2 * Math.PI);
    ctx.fill();
}

function strokeLine(ctx: CanvasRenderingContext2D, start: Vector2, end: Vector2) {
    ctx.beginPath();
    ctx.moveTo(...start.array());
    ctx.lineTo(...end.array());
    ctx.stroke();
}

function canvasSize(ctx: CanvasRenderingContext2D): Vector2 {
    return new Vector2(ctx.canvas.width, ctx.canvas.height);
}

function rayStep(ctx: CanvasRenderingContext2D, p1: Vector2, p2: Vector2): Vector2 {
    // y = k*x + c
    // x = (y - c) / k
    let p3 = p2;
    const d = p2.sub(p1);
    const k = d.y / d.x;
    if (d.x !== 0) {
        const k = d.y / d.x;
        const c = p1.y - k * p1.x;
        {
            const x3 = snap(p2.x, d.x);
            const y3 = k * x3 + c;
            p3 = new Vector2(x3, y3);
            ctx.fillStyle = "green";
            fillCircle(ctx, new Vector2(x3, y3), 0.1);
        }
        if (k !== 0) {
            const y3 = snap(p2.y, d.y);
            const x3 = (y3 - c) / k;
            const p3t = new Vector2(x3, y3);
            if (p2.distanceTo(p3t) < p2.distanceTo(p3)) {
                p3 = p3t;
            }
            ctx.fillStyle = "blue";
            fillCircle(ctx, new Vector2(x3, y3), 0.1);
        }

    }
    return p3;
}

function snap(x: number, dx: number): number {
    if (dx > 0) {
        return Math.ceil(x);
    }
    if (dx < 0) {
        return Math.floor(x);
    }
    return x;
}


function grid(ctx: CanvasRenderingContext2D, p2: Vector2 | undefined) {
    ctx.reset();
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.scale(ctx.canvas.width / GRID_COLS, ctx.canvas.height / GRID_COLS);
    ctx.lineWidth = 0.02;


    ctx.strokeStyle = "#303030";
    for (let x = 0; x <= GRID_COLS; x++) {
        strokeLine(ctx, new Vector2(x, 0), new Vector2(x, GRID_ROWS));
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
        strokeLine(ctx, new Vector2(0, y), new Vector2(GRID_COLS, y));
    }

    ctx.fillStyle = "maroon";
    const p1 = GRID_SIZE.div(new Vector2(2, 2));
    fillCircle(ctx, p1, 0.2,);

    if (p2 !== undefined) {
        fillCircle(ctx, p2, 0.2);
        ctx.strokeStyle = "maroon";
        strokeLine(ctx, p1, p2);
        const p3 = rayStep(ctx, p1, p2);
        ctx.fillStyle = "red";
        fillCircle(ctx, p3, 0.2);
        strokeLine(ctx, p2, p3);
    }
}

(() => {
    const game = document.getElementById("game") as (HTMLCanvasElement | null);
    if (game === null) {
        throw new Error("No Canvas with id 'game' is found");
    }
    game.width = 800;
    game.height = 800;
    const ctx = game.getContext("2d");
    if (ctx === null) {
        throw new Error("2D context is not supported");
    }
    let p2: Vector2 | undefined = undefined;
    game.addEventListener("mousemove", (event) => {
        const p2 = new Vector2(event.offsetX, event.offsetY)
            .div(canvasSize(ctx))
            .mul(new Vector2(GRID_COLS, GRID_ROWS));
        grid(ctx, p2);
    });
    grid(ctx, p2);

})()

