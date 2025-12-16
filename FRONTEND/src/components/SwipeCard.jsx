// import { motion, useMotionValue } from "framer-motion";

// export default function SwipeCard({ user }) {
//   const x = useMotionValue(0);

//   return (
//     <motion.div
//       drag="x"
//       style={{ x }}
//       dragConstraints={{ left: -200, right: 200 }}
//       className="glass p-6 w-72"
//     >
//       <h3 className="text-xl">{user.name}</h3>
//       <p>Teaches: {user.skillsToTeach.join(", ")}</p>
//       <p>Learns: {user.skillsToLearn.join(", ")}</p>
//     </motion.div>
//   );
// }


import { motion } from "framer-motion";

export default function SwipeCard({ skill }) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      className="w-80 h-96 glass flex flex-col justify-center items-center"
    >
      <h2 className="text-2xl font-bold">{skill.name}</h2>
      <p className="text-gray-400 mt-4">{skill.mode}</p>
    </motion.div>
  );
}
