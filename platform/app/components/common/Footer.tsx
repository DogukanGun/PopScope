const Footer = () => {
  return (
    <footer className="bg-white shadow-md dark:bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} PopScope. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 