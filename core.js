import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Cube_Single_Strip extends Shape {
    constructor() {
        super("positions", "normals");
        // TODO (Extra credit part I)
        this.arrays.position = Vector3.cast(
        [-1, 1, -1], [-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]);
        this.arrays.normal = Vector3.cast(
        [-1, 1, -1], [-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, -1]);
        this.indices.push(0, 1, 2, 0, 2, 3, 2, 3, 4, 2, 4, 5, 4, 5, 6, 4, 6, 7, 0, 6,
            7, 0, 1, 6, 0, 3, 4, 0, 4, 7, 1, 2, 5, 1, 5, 6);
    }
}


class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'strip': new Cube_Single_Strip(),
            'sphere': new defs.Subdivision_Sphere(4),
        };
        this.set_colors();
        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -10, -50));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class Assignment2 extends Base_Scene {

    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
     constructor() {
         super();

        // Flag which signals whether the round has started or ended
        this.flag = false;
        this.endFlag = false;

         // Player Position (Plate Length: 4)
         this.leftPlayer = Mat4.identity().times(Mat4.translation(-27,10,0)).times(Mat4.scale(0.5,4,1));
         this.rightPlayer = Mat4.identity().times(Mat4.translation(27,10,0)).times(Mat4.scale(0.5,4,1));

         // Boundary Position (Total Field Dimension: 70 * 40)
         this.upperBound = Mat4.identity().times(Mat4.translation(0,30,0)).times(Mat4.scale(35,0.1,1));
         this.lowerBound = Mat4.identity().times(Mat4.translation(0,-10,0)).times(Mat4.scale(35,0.1,1));
         this.leftBound = Mat4.identity().times(Mat4.translation(-35,10,0)).times(Mat4.scale(0.1,20,1));
         this.rightBound = Mat4.identity().times(Mat4.translation(35,10,0)).times(Mat4.scale(0.1,20,1));

         // Ball Position and Velocity
         this.ball = Mat4.identity().times(Mat4.translation(-25.5,10,0));
         this.totalSpeed = 10;
         this.xv = 0;
         this.yv = 0;
         this.xvMax = 8; this.xvMin = 2;

         // Difficulty (Ball Speed) Option
         this.easy = 1000;
         this.medium = 500;
         this.hard = 200;
         this.difficulty = this.medium; // Default is medium
     }

    set_colors() {
        this.colors = Array(8).fill(0).map(x => color(Math.random(), Math.random(), Math.random(),1));
    }

    // Player Movement_Controls (Enforced the plates not to go over the boundaries)
    leftUp() {
        if (this.leftPlayer[1][3] < this.upperBound[1][3] - 4.5)
            this.leftPlayer = this.leftPlayer.times(Mat4.translation(0,0.5,0));
    }
    leftDown() {
        if (this.leftPlayer[1][3] > this.lowerBound[1][3] + 4.5)
            this.leftPlayer = this.leftPlayer.times(Mat4.translation(0,-0.5,0));
    }
    rightUp() {
        if (this.rightPlayer[1][3] < this.upperBound[1][3] - 4.5)
            this.rightPlayer = this.rightPlayer.times(Mat4.translation(0,0.5,0));
    }
    rightDown() {
        if (this.rightPlayer[1][3] > this.lowerBound[1][3] + 4.5)
            this.rightPlayer = this.rightPlayer.times(Mat4.translation(0,-0.5,0));
    }
       
    // Intitialize Ball Movement_Controls
    throwPitch() {
        if (!this.flag) {
            this.xv = Math.random() * (this.xvMax - this.xvMin) + this.xvMin;
            this.yv = Math.sqrt(this.totalSpeed**2 - this.xv**2);
            if (Math.random() > 0.5)
                this.yv = -1 * this.yv;
            // Signals the start of this round
            this.flag = true;
        }
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        this.key_triggered_button("New Round", ["q"], this.throwPitch);
        //this.key_triggered_button("Easy", ["5"],() => this.difficulty = () => this.easy);
        //this.key_triggered_button("Meidum", ["6"],() => this.difficulty = () => this.medium);
        //this.key_triggered_button("Hard", ["7"],() => this.difficulty = () => this.hard);
        this.new_line();
        // Add a button for controlling the scene.
        this.key_triggered_button("Player1 UP", ["t"], this.leftUp);this.new_line();
        this.key_triggered_button("Player1 DOWN", ["g"], this.leftDown); this.new_line();
        this.key_triggered_button("Player2 UP", ["i"], this.rightUp); this.new_line();
        this.key_triggered_button("Player2 DOWN", ["k"], this.rightDown); this.new_line();
    }

    draw_box(context, program_state, model_transform, i) {
        this.shapes.strip.draw(context, program_state, model_transform, this.materials.plastic.override({color:this.colors[i]}), "TRIANGLE_STRIP");
        model_transform = model_transform.times(Mat4.translation(1,1,0)).times(Mat4.translation(-1,1,0));
        return model_transform;
    }
    
    // Detect Collision at every frame
    collision_detector() {
        // Upper and Lower Boundary Collision
        if (this.ball[1][3] >= this.upperBound[1][3] - 1 || this.ball[1][3] <= this.lowerBound[1][3] + 1)
            this.yv = -1 * this.yv;
        // Left and Right Boundary Collision
        else if (this.ball[0][3] >= this.rightBound[0][3] - 1 || this.ball[0][3] <= this.leftBound[0][3] + 1)
            this.endFlag = true;
        // Left Player Collision
        else if (this.ball[0][3] <= this.leftPlayer[0][3] + 1 && this.ball[0][3] >= this.leftPlayer[0][3] - 1) {
            if (this.ball[1][3] <= this.leftPlayer[1][3] + 5 && this.ball[1][3] >= this.leftPlayer[1][3] - 5)
                this.xv = -1 * this.xv;
        }
        // Right Player Collision
        else if (this.ball[0][3] <= this.rightPlayer[0][3] + 1 && this.ball[0][3] >= this.rightPlayer[0][3] - 1) {
            if (this.ball[1][3] <= this.rightPlayer[1][3] + 5 && this.ball[1][3] >= this.rightPlayer[1][3] - 5)
                this.xv = -1 * this.xv;
        }
    }
    
    // If the current round is over, clean the stage
    cleanStage() {
        this.flag = false;
        this.endFlag = false;

         // Player Position (Plate Length: 4)
         this.leftPlayer = Mat4.identity().times(Mat4.translation(-27,10,0)).times(Mat4.scale(0.5,4,1));
         this.rightPlayer = Mat4.identity().times(Mat4.translation(27,10,0)).times(Mat4.scale(0.5,4,1));

         // Boundary Position (Total Field Dimension: 70 * 40)
         this.upperBound = Mat4.identity().times(Mat4.translation(0,30,0)).times(Mat4.scale(35,0.1,1));
         this.lowerBound = Mat4.identity().times(Mat4.translation(0,-10,0)).times(Mat4.scale(35,0.1,1));
         this.leftBound = Mat4.identity().times(Mat4.translation(-35,10,0)).times(Mat4.scale(0.1,20,1));
         this.rightBound = Mat4.identity().times(Mat4.translation(35,10,0)).times(Mat4.scale(0.1,20,1));

         // Ball Position and Velocity
         this.ball = Mat4.identity().times(Mat4.translation(-25.5,10,0));
         this.totalSpeed = 10;
         this.xv = 0;
         this.yv = 0;
    }

    display(context, program_state) {
        super.display(context, program_state);
        let model_transform = Mat4.identity();
        
        // Time Definition
        const t = program_state.animation_delta_time / this.difficulty;
        
        // Game Boundary
        model_transform = this.draw_box(context, program_state, this.leftBound, 1);
        model_transform = this.draw_box(context, program_state, this.rightBound, 2);
        model_transform = this.draw_box(context, program_state, this.upperBound, 3);
        model_transform = this.draw_box(context, program_state, this.lowerBound, 3);

        // Player Plates
        model_transform = this.draw_box(context, program_state, this.leftPlayer, 1);
        model_transform = this.draw_box(context, program_state, this.rightPlayer, 2);


        // Ball
        this.ball = this.ball.times(Mat4.translation(t*this.xv,t*this.yv,0));
        model_transform = this.shapes.sphere.draw(context, program_state, this.ball, 
                        this.materials.plastic.override({color:this.colors[4]}));
        this.collision_detector();
        if (this.endFlag)
            this.cleanStage();
    }
}