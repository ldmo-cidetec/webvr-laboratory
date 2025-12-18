class InvertedPendulum {
    constructor() {
        // Dynamic parameters
        this.m1 = 0.2275; // Cart mass (kg)
        this.m2 = 0.0923; // Pendulum mass (kg)
        this.g = 9.81; // Gravity acceleration in Earth (m/s^2)
        this.l = 0.1950 * 2.0; // Pendulum lenght (m)
        this.lc = 0.5 * this.l; // Pendulum mass center length (m)
        this.b1 = 0.025; // Cart viscous friction coefficient (N.s/m)
        this.b2 = 0.025; // Pendulum viscous friction coefficient (N.m.s/rad)
        this.I1 = 7.083E-6; // Cart inertia (kg.m^2)
        this.I2 = 0.0029; // Pendulum inertia (kg.m^2)

        // Control parameters
        this.kp1 = 0; // PID proportional gain (cart)
        this.ki1 = 0; // PID integral gain (cart)
        this.kd1 = 0; // PID derivative gain (cart)

        this.kp2 = 0; // PID proportional gain (pendulum)
        this.ki2 = 0; // PID integral gain (pendulum)
        this.kd2 = 0; // PID derivative gain (pendulum)

        this.ie1 = 0; // Integral error (cart)
        this.ie2 = 0; // Integral error (pendulum)

        this.x_d = 0; // Desired position (cart)
        this.xdot_d = 0; // Desired speed (cart)
        this.th_d = 0; // Desired angular position (pendulum)
        this.thdot_d = 0; // Desired angular speed (pendulum)

        // Time parameters
        this.dt = 0.005; // Sampling interval (s)

        // System states and initial conditions (z)
        this.x = 0; // Position (cart)
        this.xdot = 0; // Speed (cart)
        this.th = 0; // Angular position (pendulum)
        this.thdot = 0; // Angular speed (pendulum)
    }

    // input: z (current state), u (control input), t (time)
    // output: zdot (derivated state)
    computeDynamics(z, u, t) {
        var x = z[0];
        var th = z[1];
        var xdot = z[2];
        var thdot = z[3];

        var u1 = u[0];
        var u2 = u[1];

        // Dynamics in the state space
        var m11 = this.m1 + this.m2;
        var m12 = this.m2 * this.lc * Math.cos(th);
        var m21 = this.m2 * this.lc * Math.cos(th);
        var m22 = this.m2 * Math.pow(this.lc , 2) + this.I2;

        var c11 = this.b1;
        var c12 = -this.m2 * this.lc * thdot * Math.sin(th);
        var c21 = 0;
        var c22 = this.b2;

        var g1 = 0;
        var g2 = this.m2 * this.g * this.lc * Math.sin(th);

        var M_common = 1.0 / (m11 * m22 - m12 * m21);
        var z1dot = xdot;
        var z2dot = thdot;
        var z3dot = m12 * (g2 - u2 + thdot * c22 + xdot * c21) - m22 * (g1 - u1 + thdot * c12 + xdot * c11);
        var z4dot = m21 * (g1 - u1 + thdot * c12 + xdot * c11) - m11 * (g2 - u2 + thdot * c22 + xdot * c21);
        z3dot *= M_common;
        z4dot *= M_common;

        return [z1dot, z2dot, z3dot, z4dot];
    }


    simulateStep() {
        // Compute errors
        var e1 = this.x_d - this.x; // position error (cart)
        var e2 = this.th_d - this.th; // angular position error (pendulum)

        var e1dot = this.xdot_d - this.xdot; // speed error (cart)
        var e2dot = this.thdot_d - this.thdot; // angular speed error (pendulum)

        // Compute control action with the PID controller
        var u1 = this.kp1 * e1 + this.kd1 * e1dot + this.ki1 * this.ie1; // Cart control action (N)
        var u2 = this.kp2 * e2 + this.kd2 * e2dot + this.ki2 * this.ie2; // Pendulum control action (N.m)
        
        // Actuator limits
        if (Math.abs(u1) >= 0.5) { // Max 0.5 N
            u1 = 0.5 * Math.sign(u1);
        }
        
        if (Math.abs(u2) >= 1.0) { // Max 1.0 Nm
            u2 = 1.0 * Math.sign(u2);
        }

        // Physical constraint
        if (this.x < -0.205) { // Less than -20.5 cm 
            u1 = 0;
            this.x=-0.205;
        }

        if (this.x > 0.195) { // More than 19.5 cm 
            u1 = 0;
            this.x=0.195;
        }

        // Compute dynamics
        var zdot = this.computeDynamics([this.x, this.th, this.xdot, this.thdot], [u1, u2], 0);

        // Numerical integration
        this.x = this.x + zdot[0] * this.dt;
        this.th = this.th + zdot[1] * this.dt;
        this.xdot = this.xdot + zdot[2] * this.dt;
        this.thdot = this.thdot + zdot[3] * this.dt;

        this.ie1 = this.ie1 + e1 * this.dt;
        this.ie2 = this.ie2 + e2 * this.dt;


    }

    setInitialConditions(x_0, th_0, xdot_0, thdot_0) {
        this.x = x_0;
        this.xdot = xdot_0;

        this.th = th_0;
        this.thdot = thdot_0;

        this.ie1 = 0;
        this.ie2 = 0;
    }

    setControllerGains(kp1, ki1, kd1, kp2, ki2, kd2) {
        this.kp1 = kp1;
        this.ki1 = ki1;
        this.kd1 = kd1;

        this.kp2 = kp2;
        this.ki2 = ki2;
        this.kd2 = kd2;
    }

    setPositionRegulationTask(x_d, th_d) {
        this.x_d = x_d;
        this.xdot_d = 0;

        this.th_d = th_d;
        this.thdot_d = 0;
    }
}

export default InvertedPendulum;