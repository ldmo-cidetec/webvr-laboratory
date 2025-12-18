class MassSpringDamper {
    constructor() {
        // Dynamic parameters
        this.m = 0.1; // Mass (kg)
        this.g = 9.81; // Gravity acceleration in Earth (m/s^2)
        this.k = 7.5; // Spring constant (N/m)
        this.b = 0.5; // Viscous friction coefficient (N.s/m)
        this.l0 = 0.25; // Natural spring length (m)


        // Control parameters
        this.kp = 0; // PID proportional gain
        this.ki = 0; // PID integral gain
        this.kd = 0; // PID derivative gain

        this.ie = 0; // Integral error

        this.x_d = 0; // Desired mass position
        this.xdot_d = 0; // Desired mass speed

        // Time parameters
        this.dt = 0.005; // Sampling interval (s)

        // System states and initial conditions (z)
        this.x = 0; // Mass position
        this.xdot = 0; // Mass speed
    }

    // input: z (current state), u (control input), t (time)
    // output: zdot (derivated state)
    computeDynamics(z, u, t) {
        var x = z[0];
        var xdot = z[1];

        // Dynamics in the state space
        var z1dot = xdot;
        var z2dot = (u - this.m * this.g - this.b * xdot + this.k* (this.l0 - x)) / this.m;
        return [z1dot, z2dot];
    }


    simulateStep() {
        // Compute errors
        var e = this.x_d - this.x; // mass position error
        var edot = this.xdot_d - this.xdot; // mass speed error

        // Compute control action with the PID controller
        var u = this.kp * e + this.kd * edot + this.ki * this.ie; // Control action (N.m)
        
        // Actuator limits
        if (Math.abs(u) >= 2.5) { // Max 2.5 N
            u = 2.5 * Math.sign(u);
        }
        // Physical constraint
        if (this.x < 0.03) { // Less than 3 cm 
            u = 0;
            this.x=0.03;
        }

        if (this.x > 0.47) { // More than 47 cm 
            u = 0;
            this.x=0.047;
        }
 
        // Compute dynamics
        var zdot = this.computeDynamics([this.x, this.xdot], u, 0);

        // Numerical integration
        this.x = this.x + zdot[0] * this.dt;
        this.xdot = this.xdot + zdot[1] * this.dt;
        this.ie = this.ie + e * this.dt;
    }

    setInitialConditions(x_0, xdot_0) {
        this.x = x_0;
        this.xdot = xdot_0;
        this.ie = 0;
    }

    setControllerGains(kp, ki, kd) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
    }

    setPositionRegulationTask(x_d) {
        this.x_d = x_d;
        this.xdot_d = 0;
    }
}

export default MassSpringDamper;