class SimplePendulum {
    constructor() {
        // Dynamic parameters
        this.m = 0.152; // Mass (kg)
        this.g = 9.81; // Gravity acceleration in Earth (m/s^2)
        this.l = 0.15; // Lenght (m)
        this.lc = 0.5 * this.l; // Mass center length (m)
        this.b = 0.025; // Viscous friction coefficient (N.m.s/rad)
        this.I = 0.0026; // Inertia (kg.m^2)

        // Control parameters
        this.kp = 0; // PID proportional gain
        this.ki = 0; // PID integral gain
        this.kd = 0; // PID derivative gain

        this.ie = 0; // Integral error

        this.th_d = 0; // Desired angular position
        this.thdot_d = 0; // Desired angular speed

        // Time parameters
        this.dt = 0.005; // Sampling interval (s)

        // System states and initial conditions (z)
        this.th = 0; // Angular position
        this.thdot = 0; // Angular speed
    }

    // input: z (current state), u (control input), t (time)
    // output: zdot (derivated state)
    computeDynamics(z, u, t) {
        var th = z[0];
        var thdot = z[1];

        // Dynamics in the state space
        var z1dot = thdot;
        var z2dot = (u - this.m * this.g * this.lc * Math.sin(th) - this.b * thdot) / (this.m * Math.pow(this.lc, 2) + this.I);
        return [z1dot, z2dot];
    }


    simulateStep() {
        // Compute errors
        var e = this.th_d - this.th; // angular position error
        var edot = this.thdot_d - this.thdot; // angular speed error

        // Compute control action with the PID controller
        var u = this.kp * e + this.kd * edot + this.ki * this.ie; // Control action (N.m)
        
        // Actuator limits
        if (Math.abs(u) >= 1.0) { // Max 1.0 Nm
            u = 1.0 * Math.sign(u);
        }

        // Compute dynamics
        var zdot = this.computeDynamics([this.th, this.thdot], u, 0);

        // Numerical integration
        this.th = this.th + zdot[0] * this.dt;
        this.thdot = this.thdot + zdot[1] * this.dt;
        this.ie = this.ie + e * this.dt;
    }

    setInitialConditions(th_0, thdot_0) {
        this.th = th_0;
        this.thdot = thdot_0;
        this.ie = 0;
    }

    setControllerGains(kp, ki, kd) {
        this.kp = kp;
        this.ki = ki;
        this.kd = kd;
    }

    setPositionRegulationTask(th_d) {
        this.th_d = th_d;
        this.thdot_d = 0;
    }
}

export default SimplePendulum;