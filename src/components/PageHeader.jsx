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
          <h1 className="font-serif text-2xl sm:text-3xl text-dark-900">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-dark-500 text-sm max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </motion.div>
  );
}
