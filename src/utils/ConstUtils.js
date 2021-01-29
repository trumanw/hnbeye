// all possible interaction types
// r_cat = 5.0  # cation-aromatic "AR1" "AR2"
// r_ari = 5.5  # pi-pi "AR3"
// r_hyd = 4.0  # hydrophobic "HY"
// r_sal = 4.5  # salt bridge "IP" "IN"
// r_hal = 3.5  # halogen interactions "HL1" "HL2" "HL3" "HL4"
// r_dis = 5.0  # all protein-ligand contacts "RE"
// r_ion = 3.4  # salt bridges with ions "IO"
// d_a_cutoff = 3.6 # "HA" "HD"
// 0123456789ABCDEF
//
// refer: The set of 26 colors for the Colour Alphabet Project suggested by Paul Green-Armytage 
// in the above-cited work "A Colour Alphabet and the Limits of Colour Coding."
export const INTYPE_COLORS = {
    "AR1": [240,163,255],
    "AR2": [0,117,220],
    "AR3": [153,63,0],
    "HY": [76,0,92],
    "IP": [25,25,25],
    "IN": [0,92,49],
    "HL1": [43,206,72],
    "HL2": [255,204,153],
    "HL3": [128,128,128],
    "HL4": [148,255,181],
    "RE": [143,124,0],
    "IO": [157,204,0],
    "HA": [194,0,136],
    "HD": [0,51,128],
};