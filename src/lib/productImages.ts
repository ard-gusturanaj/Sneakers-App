const SHOE_IMAGE_OVERRIDES: Record<string, string> = {
  'Air Max 270': 'https://image.goat.com/375/attachments/product_template_pictures/images/113/203/885/original/IB7751_200.png.png',
  'Ultraboost 22': 'https://image.goat.com/375/attachments/product_template_pictures/images/065/237/742/original/860337_00.png.png',
  '990v5': 'https://image.goat.com/375/attachments/product_template_pictures/images/092/667/809/original/495387_00.png.png',
  'Jordan 1 Retro High': 'https://image.goat.com/375/attachments/product_template_pictures/images/111/282/858/original/1597300_00.png.png',
  'Stan Smith': 'https://image.goat.com/375/attachments/product_template_pictures/images/079/740/303/original/8881_00.png.png',
  '574 Core': 'https://image.goat.com/375/attachments/product_template_pictures/images/072/114/353/original/918843_00.png.png',
  'React Infinity Run': 'https://image.goat.com/375/attachments/product_template_pictures/images/064/745/618/original/765814_00.png.png',
  NMD_R1: 'https://image.goat.com/375/attachments/product_template_pictures/images/057/448/172/original/782152_00.png.png',
  'Fresh Foam 1080v11': 'https://image.goat.com/375/attachments/product_template_pictures/images/049/708/867/original/M1080W11.png.png',
  'Air Force 1': 'https://image.goat.com/375/attachments/product_template_pictures/images/113/540/377/original/712867_00.png.png',
  Superstar: 'https://image.goat.com/375/attachments/product_template_pictures/images/109/757/994/original/1557041_00.png.png',
  '327': 'https://image.goat.com/375/attachments/product_template_pictures/images/100/868/228/original/748506_00.png.png',
  'Dunk Low Championship': 'https://image.goat.com/375/attachments/product_template_pictures/images/066/540/550/original/881038_00.png.png',
  'Yeezy Boost 350 V2': 'https://image.goat.com/375/attachments/product_template_pictures/images/089/100/257/original/1072889_00.png.png',
  '2002R Protection Pack': 'https://image.goat.com/375/attachments/product_template_pictures/images/114/482/606/original/793108_00.png.png',
  'Blazer Mid Vintage': 'https://image.goat.com/375/attachments/product_template_pictures/images/083/158/389/original/539628_00.png.png',
  'Forum Low Bad Bunny': 'https://image.goat.com/375/attachments/product_template_pictures/images/081/532/677/original/1084842_00.png.png',
  '550 White Green': 'https://image.goat.com/375/attachments/product_template_pictures/images/102/479/026/original/781801_00.png.png',
};

export const getProductImageUrl = (productName: string, fallbackImageUrl: string) =>
  SHOE_IMAGE_OVERRIDES[productName] || fallbackImageUrl;
