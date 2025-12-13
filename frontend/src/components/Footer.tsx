

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Quiz Portal</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Empowering learners through interactive assessments and skill-building quizzes. Your journey to knowledge excellence starts here.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600">Quiz Library</a></li>
              <li><a href="#" className="hover:text-blue-600">Leaderboard</a></li>
              <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Email: vishnumaxpolla32@gmail.com<br />
              Phone: +91 8523851643
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Quiz Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
