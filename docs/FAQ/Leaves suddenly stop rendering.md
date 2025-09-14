![](../images/missing-leaves.png)

# Leaves suddenly sto rendering

In case your kelp suddenly stops rendering leaves, this usually hints to the default limit (50k) of the kelp leaf vfx graph being reached. To increase the default capacity do the following:

1. Open `Stylized Kelp > Shaders > Kelp Leaf.vfx`
2. In the top beneath `Initialize Particles` increase the number of particles to i.e. 75000
3. Save the vfx graph and reenter play mode