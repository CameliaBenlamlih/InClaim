import { motion } from 'framer-motion';

export default function PageHeader({ title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 max-w-2xl">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </motion.div>
  );
}
