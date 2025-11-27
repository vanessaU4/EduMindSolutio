
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Customer Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex">

  <div class="w-64 bg-gray-800 text-white flex flex-col pt-10 fixed h-full">
    <h2 class="text-xl font-bold text-center mb-6">Customer Panel</h2>
    <nav class="flex flex-col gap-2">
      <a href="#balance" class="px-6 py-3 hover:bg-gray-700 bg-gray-700 rounded-r-full">💰 Balance</a>
      <a href="#orders" class="px-6 py-3 hover:bg-gray-700">📦 Orders</a>
      <a href="#logout" class="px-6 py-3 hover:bg-gray-700">🚪 Logout</a>
    </nav>
  </div>


  <div class="ml-64 p-10 w-full">
   
    <section id="balance">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-2">Your Balance</h3>
        <p class="text-2xl font-bold text-gray-700">USD <strong>120.00</strong></p>
      </div>
    </section>


    <section id="orders" class="mt-10">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-xl font-semibold mb-4">Your Orders</h3>
        <ul class="divide-y divide-gray-200">
          <li class="py-2">Order #1001 - <span class="text-green-600">Completed</span></li>
          <li class="py-2">Order #1002 - <span class="text-yellow-500">Pending</span></li>
        </ul>
      </div>
    </section>

    
    <section id="logout" class="mt-10">
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <button class="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md">
          Logout
        </button>
      </div>
    </section>
  </div>

</body>
</html>
