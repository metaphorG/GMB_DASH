import { useState, useMemo, useCallback, Fragment, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════
// JSONBIN CONFIGURATION — paste your values here
// ═══════════════════════════════════════════════════════════════════
const JSONBIN_ID  = '6a02d428c0954111d80ef22c';      // e.g. '6830abc123def456'
const JSONBIN_KEY = '$2a$10$F1LfGWg51BWexG/3aptWR.9LiWTSjKP5ozoASlZydrByLgYsa5wSy';  // e.g. '$2b$10$abc...'
const BIN_URL     = 'https://api.jsonbin.io/v3/b/' + JSONBIN_ID;
const HDR_READ    = { 'X-Master-Key': JSONBIN_KEY, 'X-Bin-Meta': 'false' };
const HDR_WRITE   = { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY };
const CONFIGURED  = JSONBIN_ID !== 'YOUR_BIN_ID_HERE' && JSONBIN_KEY !== 'YOUR_MASTER_KEY_HERE';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const CY = 2025;
const PORT_NAMES = ['Alang','Bhavnagar','Jafrabad','Jamnagar','Magdalla','Mandvi','Mangrol','Navlakhi','Okha','Porbandar','Veraval','Dahej','Hazira','Mundra'];
const PG_IDX = {'Magdalla':0,'Dahej':0,'Hazira':0,'Bhavnagar':1,'Alang':1,'Navlakhi':1,'Jamnagar':2,'Okha':2,'Mundra':2,'Mandvi':2,'Veraval':3,'Porbandar':3,'Mangrol':3,'Jafrabad':3};
const PG_NAMES = ['South Gujarat Coast','Saurashtra East','Saurashtra West','South Saurashtra'];

const RAW = [
[800.0,0,0,"M/s S.&S. Brothers Ahmedabad.",1983,1993],
[800.0,0,0,"M/S Ushmaniya Oxygen Pvt. Ltd. Bombay.",1983,1993],
[600.0,0,0,"M/s Capital Oxygen Co. New Delhi.",2015,2025],
[600.0,0,0,"M/s Supirior Air Product Ltd, New Delhi.",1985,1995],
[800.0,0,0,"M/s Aims Oxygen Pvt, Ltd, Baroda.",1983,1993],
[600.0,0,0,"M/s Sharma & Co. Bombay.",1986,1996],
[425.0,0,0,"Indian Red Cross Society.",1983,2013],
[800.0,0,0,"SBS, Bhavnagar",1984,2014],
[875.0,0,0,"M/s Shirdi Steel Traders. Bhavnagar.",1995,2010],
[875.0,0,0,"M/s Gupta Steel, Bhavnagar.",1995,2010],
[240.0,0,0,"Dr.M. Amin A. Hamidani. Bhavnagar.",1997,2016],
[600.0,0,0,"M/s Hindustan Gas & Indu. Ltd.",1986,1996],
[600.0,0,0,"M/s Peckok Chemicals Pvt.Ltd",1987,1997],
[800.0,0,0,"Shri B M Shah & Sons Bhavnagar",1983,1993],
[300.0,0,0,"Shri Pravin Vaja",1986,1996],
[441.0,0,0,"M/s Bombay weigh bridge, Bhavnagar.",2005,2010],
[964.5,0,0,"Shri Manoharsinh Jagatsinh Chauhan.",2014,2014],
[3375.0,0,0,"M/s Gujarat Gas Ltd",2015,2025],
[590.0,1,0,"Shri Chimanlal. N. Patel Bhavnagar.",1975,1995],
[416.58,1,0,"Shri Keshavlal H Patel & Co.Bhavnagar.",1975,1994],
[744.0,1,0,"Shri Nagindas N Pate Bhavnagar.",1975,1990],
[919.37,1,0,"M/s J J Patel Gas Agency, Bhavnagar.",1983,1993],
[75000.0,1,0,"M/s Bhavnagar Vegitable Products Ltd, Bhavnagar.",1986,1986],
[919.46,1,0,"M/s H P Vitthalpara. Bhavnagar.",1984,1994],
[899.39,1,0,"M/s B K Mansatar. Bhavnagar.",1985,1995],
[836.43,1,0,"M/s H k kamdar & Sons. Bhavnagar.",2015,2025],
[100.0,1,0,"M/s Union Fair scale",1983,2013],
[3442.5,1,0,"M/s Mars Metal Oxides & Alloys Corporation Bhavnagar.",1994,1999],
[928.0,1,0,"M/s Namrta Gas Agency Bhavnagar.",1994,1999],
[250.61,1,0,"M/s J M Baxi & Co. Bombay.",1994,2009],
[791.0,1,0,"M/s. Jirawala Plastic, Bhavnagar",2014,2038],
[900.0,1,0,"M/s Bharat Petroium Corporation Ltd.",1995,2005],
[196.0,1,0,"M/s Dhandin Weigh Bridge Bhavnagar.",1996,2030],
[1400.0,1,0,"M/s Sea Land Shipping & Export Pvt, Ltd.",1996,2001],
[928.0,1,0,"Shri Dilipsinh Ajitsinh Gohil",1996,2001],
[960.0,1,0,"Smt.Ushaben R Agrawal",1991,2001],
[2500.0,1,0,"M/s. Laxmi Toughen Glass, Bhavnagar",2015,2020],
[900.0,1,0,"Smt.Daxaben Dharmeshbhai Manadalia",2013,2027],
[800.0,1,0,"M/s. Shrenik Sales Corporation, Bhavnagar",2014,2038],
[2500.0,1,0,"M/s Bhavna Marine Engineers.Bhvngar.",2001,2025],
[1044.0,1,0,"Shri Nileshkumar H Patel",2002,2006],
[750.0,1,0,"Shri Jitendra Manubhai Vyas. Bhavnagar.",2002,2007],
[682.84,1,0,"Shri Kiritkumar Harilal Patel",1990,1995],
[400.0,1,0,"Saurashtra Petroliums Ltd",1990,1995],
[800.0,1,0,"M/s. Param Plastic Industries, Bhavnagar",2014,2019],
[1000.0,1,0,"The District Superintendent of Police.Bhavnagar. Coastal Marine Police Stat",2008,2008],
[9058.0,1,0,"M/s J.K.Steel & Alloys, Bhavnagar",1971,2001],
[1134.0,1,0,"M/s. Sea services Pvt. Ltd. Ahmedabad",1995,1996],
[900.0,1,0,"M/s. Heena Gases, Bhavnagar",2015,2020],
[1000.0,1,0,"Smt.Khamaba Dilaversingh Gohil, Bhavnagar",2017,2026],
[222.71,1,0,"Shri Vishalpara Unnit Girishkumar, Bhavnagar",2014,2019],
[155.04,1,0,"Shri Vishalpara Unnit Girishkumar, Bhavnagar",2014,2019],
[547.2,1,0,"Shri Nitinbhai Vallabhbhai Loriya, Bhavnagar",2014,2019],
[1800.0,1,0,"Shri Kirit Jayantilal Bhatt, Bhavnagar",2013,2018],
[4.0,1,0,"M/s. Reliance Jio Infocomm Limited, Ahmedabad",2015,2019],
[9.0,1,0,"M/s. Reliance Jio Infocomm Limited, Ahmedabad",2019,2024],
[2100.0,1,0,"Mrs.Pravasini Rajeshbhai Joshi",2015,2025],
[1800.0,1,0,"Mr. Dhirajkumar Gyanchand Rajai",2015,2025],
[700.0,1,0,"M/s. Shrenik Sales Corporation, Bhavnagar",2015,2025],
[1250.0,1,0,"M/s. Patanjali Marine",2015,2025],
[10000.0,1,0,"M/s. Mahek Agro Mineral Pvt. Ltd.",2015,2025],
[1250.0,1,0,"M/s. Maya Marine & Logistics",2015,2025],
[450.0,2,0,"M/s Jafrabad Matsyodhyog Fish Purchase-sale Seva Sahkari Mandali, Jafrabad.",1994,2004],
[137.0,2,0,"Police-sub-Inspector. Jafrabad.",2002,2012],
[7161.0,3,0,"Gujarat Ware housing Co. Jamnagar.",1983,2023],
[600.0,3,0,"M/s N.K. Parmar. Jamnagar.",1991,2025],
[29071.0,3,0,"M/s Shakti Clearing Agency pvt, ltd. Jamnagar.",1999,2014],
[55.35,3,0,"Director of Light houes & lightships. Jamnagar.",1986,2001],
[750.0,3,0,"Shri salaya Machhimar Sahkari Mandali Ltd. Jamnagar.",1982,1991],
[10156.0,3,0,"M/s Integreted Proteins ltd. Jamnagar.",1994,1999],
[23717.5,3,0,"M/s Reliance Petroleum Ltd. Jamnagar.",1998,2027],
[1103.6,3,0,"M/s Veer Dock co.Pvt. Ltd. Jamnagar.",1992,1997],
[464.51,3,0,"Shri Jamnagar Panjrapol. Jamnagar.",1977,1997],
[1524.0,3,0,"Shri Ajij.J. Charaniya. Jamnagar.",2015,2025],
[227113.0,3,0,"M/s Digvijay Cement & Co, Ltd. Sikka.",1997,2007],
[7800.0,3,0,"The Fisheries Department Govt. of Gujarat.",2015,2025],
[560.0,3,0,"Shri Jamnagar Panjrapol. Jamnagar.",1991,2001],
[1063.21,3,0,"M/S Costum House Agent Association Jamnagar",2003,2003],
[3600.0,3,0,"M/s Shakti Clearing agency pvt, ltd Jamnagar.",1998,2003],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[600.0,3,0,"M/s. Shreeji Shipping, Jamnagar",2019,2023],
[500.0,3,0,"M/s. Shreeji Shipping, Jamnagar",2021,2025],
[500.0,3,0,"M/s.Vasuki Tradelink Pvt. Ltd, Rajkot",2021,2025],
[210.0,4,0,"M/s Gayatri weighbridge, Magdalla.",1990,2020],
[1700.0,4,0,"M/s Ashwani Shipping Corporation.Surat. Now M/s Ashwani Shipping.Surat",1997,2012],
[300.0,4,0,"Gujarat Fisheries Central Co, Op,Ltd, Ahmedabad",1992,2021],
[300.0,4,0,"Gujarat Fisheries Central Co, Op,Ltd, Ahmedabad",1992,2021],
[350.0,5,0,"Shri Nurmamad H Sangani. MotaSalaya, Mandvi.",2000,2010],
[660.0,5,0,"M/s Gujarat Fesheries. C.C.A Ltd; Ahmedabad.",2001,2011],
[1225.0,5,0,"M/s Zarpara Matsyodhyog Seva Sahkari Mandali Ltd.",1997,2002],
[165.0,5,0,"M/s Sara Engineering Works, Mandvi",2008,2013],
[38.2,5,0,"The Area Managar. Bharat Sanchar Nigam ltd. Gandhidham.Kutchh. BSNL",2007,2017],
[1000.0,5,0,"Adani Port Ltd., Ahmedabad",1994,1999],
[4740.0,7,0,"M/s Chaugule & Co;Ltd; Dhrol Now M/s Chaugule & Co (salt) Privete Limited.",2002,2026],
[450.0,7,0,"M/s Gayatri Weigh bridge. Navlakhi",2011,2035],
[220.0,7,0,"General Manager Bharat Sanchar Nagam Ltd. Rajkot.",2009,2014],
[300.0,7,0,"The Destrict Superintendent of Police Rajkot Rural",2009,2009],
[233.0,7,0,"M/s Indus Tower Ahmedabad",2017,2021],
[400.0,8,0,"M/s Pavanputra Fish Co-Op, Society Ltd, Porbander",1999,2018],
[300.0,8,0,"M/s Pavanputra Fish Co-Op, Society Ltd, Porbander",2002,2016],
[750.0,8,0,"M/s Adarsh Fish Seva Co-Op; Society Ltd, Okha.",2002,2025],
[660.0,8,0,"State Bank Of india Okha",1985,2024],
[200.0,8,0,"Police Station. Okha",2006,2006],
[900.0,8,0,"The District Superintendent of Police, Jamnagar. Coatsal Marine Police stat",2007,2007],
[1032.0,8,0,"M/s. Indian Roadlines, Jamnagar",2015,2019],
[256.0,9,0,"Shri Sagar Sarvodaya Co-Op society, Porbandar",1978,2017],
[660.0,9,0,"Smt.Premilaben N. Lodhari. Porbandar Transfer Shri Rajesh. N. Lodhari Pbr.",1991,2020],
[300.0,9,0,"M/s Associated Transport Co. Porbandar",1991,2001],
[256.0,9,0,"M/s JaySagar Fishing Co-Op, Society, Porbandar",1991,2025],
[434.0,9,0,"M/s RatnaSagar Ice Factory Porbandar.",1990,2015],
[35.55,9,0,"Smt Nilamben K. kotiya. Porbandar",1992,2021],
[459.02,9,0,"Shri SagarSakti Fishing co-Op Society, Porbandar",2000,2005],
[315.0,9,0,"Shri Hiren Enterpricies. Porbandar",2000,2014],
[1352.81,9,0,"Shri Mustaq Haji Siddik. Palkhiwala. Porbandar",2000,2014],
[428.41,9,0,"M/s Deep Ice Industries. Porbandar.",1994,2014],
[370.0,9,0,"Shri Arjan Hira Lodhari Porbandar.",1995,2019],
[464.0,9,0,"Shri Premji Kanji Lodhari Porbandar.",1995,2024],
[468.0,9,0,"Shri Jivan Padhu Masani Porbandar.",1995,2024],
[346.0,9,0,"Shri Narsi Kanji Jungi. Porbandar",1995,2024],
[1250.0,9,0,"Shri Chum Ice & Cold Storage Porbandar NOW M/s Suraj Ice & Cold Storage Por",1995,2015],
[120.4,9,0,"M/s SHVNG LPG Infastucture Pvt,Ltd. Pbr. Now M/s SHVNG LPG Infastucture. No",1995,2020],
[371.58,9,0,"Shri Dhansukh Velji Lodhari. Porbandar.",1996,2025],
[320.0,9,0,"Shri Pavanputra Fisheries Co-Op Society ltd; Porbandar.",1996,2025],
[900.0,9,0,"Shri Jaysagar Fisheries Co-Op Society Ltd; Porbandar.",1001,2025],
[468.0,9,0,"M/s Ganesh Ice Factory Porbandar.",1996,2025],
[798.0,9,0,"Shri Narsi Velji Lodhari (Star Ice Factory) Porbandar",1996,2020],
[862.8,9,0,"Shri Kanji Ramji Salet Porbandar.",2000,2024],
[748.0,9,0,"Shri Bhikhu Velji Lodhari. Porbandar.",1997,2002],
[360.0,9,0,"Shri Kishore Ratanshi Lodhari. Porbandar",2000,2005],
[519.2,9,0,"Shri Bhimji Padhu Toraniya. Porbandar.",1999,2013],
[584.85,9,0,"Shri Vivek Matsyodhog Co.Op.Ltd. Porbandar.",2000,2029],
[484.0,9,0,"Shri Hiralal Babu Masani. Porbandar.",2000,2024],
[225.0,9,0,"Shri Paresh Narsi Jungi. Porbandar",2000,2024],
[240.0,9,0,"Smt. Savitaben Narsi Jungi. Porbandar.",2000,2024],
[2161.54,9,0,"Shri Chum Fresh Fish. Porbandar.",2000,2014],
[930.0,9,0,"Smt. Jayaben Premjibhai Lodhari. Porbandar.",2000,2010],
[350.0,9,0,"Shri Faruq Haji Sidik Palkhivala. Porbandar. NOW M/s. Aftab Exports, Porban",2000,2014],
[286.0,9,0,"Shri Narsi Babubhai Masani. Porbandar.",2001,2025],
[135.0,9,0,"Shri Narsi B Masani. Porbandar.",2001,2025],
[400.0,9,0,"Shri Rajdhani Fisheries Co.Op.Ltd. Porbandar.",2001,2006],
[2100.0,9,0,"Shri Amar Fish Pilling Shed. Porbandar Now transferred to M/s. Gajraj Fish",2001,2015],
[632.0,9,0,"Shri Naran Mepa Lodhari. Porbandar. Transfer Shri Jitendra N. Lodhari. Porb",2001,2025],
[300.0,9,0,"Shri Vinod Premji Kotiya. Porbandar.",2001,2011],
[227.0,9,0,"Shri Madhavji Bhimji Motivaras. Porbandar.",2001,2025],
[600.0,9,0,"Shri Ruhi Frozen Foods. Porbandar.",2001,2025],
[1400.0,9,0,"Shri N K Jungi. Porbandar.",2002,2021],
[850.0,9,0,"Shri Dhansukh Velji Lodhari. Porbandar. Now Shri Premji Kanji Lodhari",2001,2025],
[251.2,9,0,"Shri Dinesh Ramji Postariya. Porbandar.",2002,2021],
[846.0,9,0,"Shri Babulal Jadavji Khokhri",2002,2026],
[1710.0,9,0,"Shri Kantilal Velji Jungi. Porbandar. Shri Alokkumar Harnarayan Tripathi.",2002,2022],
[798.0,9,0,"Shri karsan Ramji Salet. Porbandar.",2002,2026],
[480.0,9,0,"Shri Velji Kanji Kotiya. Porbandar.",2002,2011],
[175.0,9,0,"Shri Rajesh Naran Lodhari Porbandar NOW Smt. Pramilaben Naranbhai Lodhari",2002,2026],
[600.0,9,0,"Shri Velji Madhavji Salet. Porbandar.",2002,2026],
[2593.5,9,0,"Shri Saurastra Cement Ltd. Ranavav. Porbandar.",2002,2007],
[1371.75,9,0,"Shri Sunil Devshi Gohil",2003,2027],
[231.25,9,0,"Shri Hiralal Padhu Jungi",1995,2000],
[900.0,9,0,"Porbandar Nagarpalika",2015,2025],
[3000.0,9,0,"Smt. Sobhnaben Kantilal Jungi. Porbandar Name Transfer to Alokkumar Harnara",2008,2022],
[500.0,9,0,"The District Superintendent of Police.Porbandar. Out Post Marine Police Sta",2015,2008],
[5761.5,9,0,"Indian Nevy, Porbandar.",2015,2025],
[1389.53,9,0,"M/s Jadavbhai Varjangbhai Chudasama, Porbandar",2011,2025],
[1240.31,9,0,"Shri Chhagan Gokal Lodhari, Porbandar",2011,2016],
[2988.29,9,0,"M/s. Amrut Cold Storage Pvt.Ltd.",2015,2019],
[80.0,9,0,"Shri Siddik Jamal Sati. Porbandar Now Shri Siddik Jamal Sati, and Yunush Ja",2015,2024],
[1500.29,9,0,"Shri Mohan Hiralal Siyal, Porbandar",2016,2020],
[725.0,9,0,"The District Superintendent of Police.Porbandar.",2014,2014],
[1084.97,9,0,"Shri Mohanlal Premjibhai Motivaras, Porbandar",2012,2026],
[979.37,9,0,"Smt. Jayaben Premjibhai Lodhari. Porbandar.",1997,2026],
[600.0,9,0,"shri Pravinbhai Babubhai Masani, Porbandar",2015,2019],
[620.5,9,0,"Shri Babubhai Jadavji KhoKhri, Porbandar",2012,2026],
[240.0,9,0,"Shri Babubhai Bhikhubhai KhoKhari, Porbandar",2016,2025],
[2198.18,9,0,"Shri Harish Ramji Postaiya, Porbandar",2015,2019],
[330.0,9,0,"Shri Harjivan Khimaji Kotiya, Porbandar",2014,2023],
[864.58,9,0,"Shri Mohamedsiddiq Gulamhusain Karatela, Porbandar",2014,2023],
[504.0,9,0,"Shri Hirabhai Narshibhai Khetalpal, Mangrol",2013,2022],
[1138.76,9,0,"M/s. West Coast Foods, Porbandar",2012,2026],
[600.0,9,0,"Shri Harsh Sagar Matsyodhyog Seva Sahakari Mandli Ltd., Porbandar",2013,2027],
[535.6,9,0,"Smt.Kantaben Devjibhai Kotiya, Porbandar",2013,2027],
[383.84,9,0,"Shri Dhansukh Khimabhai Badarsahi, Porbandar",2015,2019],
[1260.0,9,0,"Shri Nitesh Arjunbhai Jungi, Porbandar",2015,2019],
[890.0,9,0,"Smt. Bhartiben Rameshbhai Gohel, Porbandar",2015,2019],
[350.0,9,0,"shri Pravinbhai Babubhai Masani, Porbandar",2022,2022],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[4360.0,9,0,"M/s. Honest Dry Fish",2023,2023],
[305.89,9,0,"Shri Kamleshbhai Babulal Gohel",2024,2024],
[733.54,9,0,"Shri Nathalal Jungi",2024,2024],
[504.0,9,0,"Shri Yunushbhai Yusufbhai Afini",2024,2024],
[300.0,9,0,"Shri Ajaybhai Jagubhai Motivaras",2024,2024],
[1842.4,9,0,"Shri Manishbhai Jagubhai Motivaras",2024,2024],
[913.54,9,0,"M/s. Nidhi Sea Food, Shri Kamleshbhai Ratanshi Badarshahi",2024,2024],
[2685.0,9,0,"M/s. Taranhar Fresh Fish, Shri Shaileshbhai Madhavji Baridun",2024,2024],
[234.0,9,0,"M/s. Riddhi Siddhi Sea Food, Shri Hemant Madhavji Baridun",2024,2024],
[5933.02,9,0,"M/s Silver Star Export",2024,2024],
[690.0,9,0,"The Superintendent of Police",2015,2025],
[1110.93,9,0,"Shri Jitendra Mepa Bharada",2015,2025],
[300.0,9,0,"M/s. Kishor Project Ltd.",2015,2025],
[511.0,9,0,"M/s. Kush Trading, Prop. Paresh Premajibhai Bharada",2022,2026],
[492.73,9,0,"Shree Mitesh Jadavaji Posatariya, C/o, Anjali Fresh Fish",2022,2026],
[960.0,9,0,"M/s. Monika Sea Foods, Prop. Mr. Nilesh Babulal Khokhari",2022,2026],
[518.92,9,0,"Shri Naran Babubhai Salet",2022,2026],
[586.72,9,0,"M/s.Khushbu Fresh Fish, Prop. Mr. Pratapbhai Premajibhai Gohel",2022,2026],
[80.0,9,0,"Ms. Vanitaben Devjibhai Badarshahi",2022,2026],
[870.76,9,0,"Shri Mahendra Devjibhai Madhvi",2022,2026],
[300.0,9,0,"M/s. Bipin Fish, Prop. Bipin Jadavbhai Bhadrecha",2022,2026],
[275.52,9,0,"Shri Kiran Jadavbhai Chudasama",2022,2026],
[150.0,9,0,"Ms. Vanitaben Devjibhai Badarshahi",2022,2026],
[2049.36,9,0,"M/s. Ekta Fisheries Co-Operative Society",2022,2026],
[960.0,9,0,"Shri Rajesh Babulal Panjari",2022,2026],
[54.05,9,0,"Shri Jayesh Jethalal Shiyal",2022,2026],
[4192.0,9,0,"M/s.Silver Fish Sterilizer",2022,2026],
[1150.0,9,0,"Shree Prakashbhai Ramajibhai Shiyal",2015,2025],
[400.0,9,0,"M/s Milan Matsyaudyog Sahakari Ltd.",2015,2025],
[1350.0,10,0,"Shri Vijay.M.Rughani. Veraval",1976,2001],
[675.0,10,0,"Shri Ibrahim Allarakha Turaq, Veraval",1988,2022],
[1350.0,10,0,"Shri Vinodchandra Vallabhchandra.Veraval",1978,1998],
[675.0,10,0,"Shri Somnath Band Saw Mill. Veraval",1978,2003],
[578.88,10,0,"Shri Divya Ice & Cold Storage. Veraval (Change the name from Minaxi ice pro",1995,2000],
[562.5,10,0,"Shri Shitlakrupa Ice & Cold Storage.Veraval.",1995,2000],
[562.5,10,0,"Shri Anjali Ice & Cold Storage. Veraval.",1995,2005],
[675.0,10,0,"Shri S.Pradipkumar. Maganlal. Veraval",1987,2031],
[675.0,10,0,"Shri Shivam Ice Factory. Veraval",1987,2031],
[631.5,10,0,"Shri Kamet Ice Industries. Veraval",1994,2018],
[633.75,10,0,"Shri Veravali Krupa Ice Factory. Veraval",1991,1996],
[675.59,10,0,"Shri Vishnulaxmi Ice Factory & Cold Storege.Veraval",1992,2025],
[637.5,10,0,"Shri J.K.Ice Factory.Veraval",1991,1996],
[675.0,10,0,"Shri Becharlal Devji Thanki. Veraval",1994,1999],
[709.5,10,0,"Makwana Eng.works&Co. Now Shri Minaxi Ice & Cold Storage Veraval",1988,2024],
[641.25,10,0,"Shri Himalaya Ice & Cold Storege.Veraval",1991,2031],
[470.0,10,0,"Shri Sunil Ice factory. Veraval",1995,2024],
[1350.0,10,0,"Shri Babubhai Narsibhai Vadhavi, Veraval",2017,2021],
[300.04,10,0,"M/s. Veraval Petroleums,Veraval",2015,2016],
[705.0,10,0,"Shri Parsottam..Bhanji. Kanabar.Veraval.",1994,1999],
[675.0,10,0,"Shri Arvindkumar Ranchhoddas. veraval",1987,1997],
[649.5,10,0,"Shri Subham Ice Product.Veraval",1991,2001],
[705.0,10,0,"Shri Shubham Product.Veraval",1990,2000],
[657.37,10,0,"Shri Cham Treding Orgenizaion. Veraval",1992,1997],
[705.0,10,0,"Shri Lavji Parmanand & co. Veraval",2015,2025],
[225.0,10,0,"Shri Narayan Work Shop. Veraval",1996,2001],
[1800.0,10,0,"Shri Mashru & Co.Veraval. NOW Shree Dinesh Meghaji Fofandi",1972,2021],
[586.05,10,0,"Shri Rahul Marine Enterprises. Veraval",1995,2025],
[899.08,10,0,"Shri Mugal Kaluhusen.Veraval",1996,2001],
[637.5,10,0,"Shri Mahamad Faruk Janmahamad Veraval",1992,2011],
[525.0,10,0,"Shri Padam Auto Service Station. Veraval NOW transfer to: M/s.Kalpana Marin",1996,2025],
[525.0,10,0,"Shri G.B. Corporation,Veraval",1995,2024],
[900.0,10,0,"Shri Padmanikrupa Ice Factory, Veraval Now Shri Mohan Damji Bhesla Veraval",1987,2026],
[439.12,10,0,"Shri Harikrupa Ice Factory,Veraval",2020,2025],
[406.88,10,0,"Shri Jagdishchandra M Kuhada now Shri Jiaijalaram Ice Factory,Veraval",2011,2036],
[362.08,10,0,"M/s Premji Meghji Ravat Now Shri Jalaram Workshop, Veraval",1994,2033],
[385.12,10,0,"Shri Ratanshi V Malam Sagar Ice Factory Now Shri Rajmoti Ice & Cold Storage",2000,2024],
[290.0,10,0,"Shri Gujarat Marble, Veraval",1990,1995],
[181.12,10,0,"Shri Jaishakti Welding Works, Veraval NOW M/s. Rameshwari Engineering Works",1990,2024],
[133.66,10,0,"Shri Sagardeep Spares,Veraval M/s Sagardeep Ice & cold storage, Veraval now",1995,2024],
[61.8,10,0,"Shri Priyank Engineering & Chemical Works, Veraval",1994,2004],
[35.84,10,0,"Shri M.P.Vaghela,Veraval",2015,2001],
[449.5,10,0,"Shri Om Ice factory,Veraval",1994,1999],
[500.0,10,0,"Shri Trivedi & Sons,Veraval",1991,1996],
[550.0,10,0,"M/s Keval Exports. Patel Niharikaben Kamleshkumar. Veraval",2007,2031],
[588.5,10,0,"Shri Kanaiya Ice & Cold Storege, Veraval",1996,2001],
[900.0,10,0,"M/s Keval Exports. Patel Niharikaben Kamleshkumar. Veraval",2007,2031],
[900.0,10,0,"Shri Rajdhani Ice factory,Veraval (Lease transfer from the name of Mr.Babub",1995,2024],
[500.0,10,0,"Shri Karsan H Agiya Now Smt.Paniben Karsan Agiya, Veraval NOW M/s.Indian Se",1994,2033],
[300.0,10,0,"Swastik Ice & Cold storage Now Shri Babubhai Hamirbhai Thapaliya, Veraval N",1994,2026],
[548.5,10,0,"Shri Manubhai Jivabhai Gadhiya, Veraval Now Ashwin Ice Factory",1992,2024],
[581.0,10,0,"Kisan Jadav kuhada Now M/s Ridhhi Sidhdhi Ice Facory. Veraval (Lease transf",1994,2033],
[600.0,10,0,"Shri Krishna Ice Factory,Veraval",1990,2000],
[500.0,10,0,"Shri Ramji Mandan Koriya. Veraval NOW Shri Jentibhai Ramjibhai Koriya",1992,2026],
[375.0,10,0,"Shri Parag Ice Factory, Veraval",1991,2025],
[450.0,10,0,"Shrinathji Ice & Cold Storage,Veraval",1995,2000],
[450.0,10,0,"Shri Radhe Ice & Cold Storage. Veraval",1995,2024],
[464.25,10,0,"Shri Jai Mahakal Ice & Cold Storage, Veraval",1995,2000],
[448.0,10,0,"Shri Chamunda Ice Products,Veraval",1996,2001],
[420.0,10,0,"Shri Chamunda ice & Cold Storage, Veraval",2015,2025],
[420.0,10,0,"Shri Maruti Ice Factory,Veraval",1990,2024],
[350.0,10,0,"Shri Bachubhai Nathabhai Tank. Veraval Now Smt.Diwaliben Bachubhai Tank",1991,2025],
[706.38,10,0,"Shri Bhagvati Ice factory,Veraval",1992,1997],
[555.0,10,0,"Shri Shivshakti Ice factory,Veraval",1994,1999],
[247.5,10,0,"Shri Lakham R.Suyani Now Shri JitendraKumar Lakham Suyani. Veraval",1995,2005],
[421.12,10,0,"Parishram Ice plant & cold storage Now Shri Parishram Spares Workshop & Ser",2015,2025],
[416.6,10,0,"Shri Ramabhai Dhanabhai Barad. Veraval",1992,2051],
[446.25,10,0,"KhaKhar weighbridge Now Shri Ratnaker Ice & Cold storage. Veraval",1994,1999],
[448.2,10,0,"shri Balaji Workshop,Vearaval",1994,1999],
[374.62,10,0,"Shri kishan Damji Bhesla, Veraval",1994,2019],
[601.11,10,0,"Shri Ease Industries, VRL.. NOW Shri Vanita Cold storage, Veraval",1994,2028],
[831.7,10,0,"Shri Vanita Cold storage, Veraval",1995,2029],
[831.7,10,0,"Shri Krishna Ice factory,Veraval",1995,2024],
[831.7,10,0,"Shri khodiyar Ice Factory, Veraval",1995,2000],
[90.0,10,0,"Shri Kiran Electrical Engineering, Veraval",2012,2026],
[667.32,10,0,"Vanita Cold Storage, Veraval",2014,2033],
[396.99,10,0,"Shri Makwana Re-powering Works. Veraval",1987,2016],
[1500.0,10,0,"Shri Monark Sea Foods Pvt,Ltd,Veraval",1974,2004],
[1770.0,10,0,"Shri Hindustan Petroliums,Veraval",1974,2004],
[988.0,10,0,"shri Kanji Jiva Solanki.Veraval Now M/s Deepmala Marine Exports. Veraval",1984,2033],
[990.0,10,0,"Shri Deepmala Marine Exports. Veraval",1995,2020],
[1976.0,10,0,"Shri Saraswati Ice & Cold Storage. Veraval",1994,1999],
[532.0,10,0,"Shri Gangasagar Ice Factory,Veraval",1991,2025],
[376.0,10,0,"Shri Trikamlal Devji Gohel. Veraval",1974,1994],
[324.0,10,0,"Shri Naran Karshan Malam, Veraval",1975,2000],
[1774.18,10,0,"Shri Veraval Samsat Ghyanti, Veraval",2009,2013],
[3020.0,10,0,"Shri Castle rock Sea Foods Pvt,Ltd,Veraval",1973,2009],
[3020.0,10,0,"Shri Castle rock Sea Foods Ltd,Veraval",1974,2013],
[3236.55,10,0,"Shri Castle rock cold storage pvt. ltd, Veraval",1989,2014],
[2531.61,10,0,"Shri Central Institute Of Fisheries Technology, Veraval",1971,2031],
[2229.67,10,0,"Shri Arjundev H Bhesla Now Shri Bhavani Sea Foods. Veraval",2015,2025],
[2229.76,10,0,"Shri Maruti Krupa Ice & Cold Storage. Veraval",2014,2024],
[3922.0,10,0,"M/s G L Sheth M/s BMG Fisheries pvt. Ltd. M/s International Creative food L",2015,2025],
[595.0,10,0,"Shri Shakti Ice & Cold Storage, Veraval",1986,2000],
[1005.0,10,0,"Shri Parishram Ice & Cold Storege, Veraval",1986,2000],
[55.74,10,0,"Shri Babubhai Ramjibhai Jungi. Veraval",2015,2025],
[55.74,10,0,"Shri Madhu Damji Khapandi, Veraval",1995,2000],
[760.0,10,0,"Shri Grives Cotton & Co. Veraval NOW M/s. Chandra Marine Machinery Store",1971,2014],
[660.0,10,0,"Shi Urmi Marine Engineering Works,Veraval",1986,2030],
[3810.94,10,0,"Shri Veraval Marine & Chemical Pvt,Ltd,Veraval Now … M/s. Bhavani Sea Foods",1978,2023],
[2010.0,10,0,"Shri Konkan Fisheries Pvt,Ltd. Veraval …. NOW M/s. Gopal Fisheries, Veraval",1971,2011],
[743.22,10,0,"Shri Konkan Fisheries Pvt,Ltd. Veraval… ….. NOW M/s. Gopal Fisheries, Verav",2015,2025],
[873.47,10,0,"M/s Veraval Marine & Chemicals Pvt,Ltd. Veraval NOW M/s. Bhavani Sea Foods",1995,2025],
[2607.56,10,0,"Shri Hariom Ice & Cold Storage, Veraval",1986,2001],
[288.0,10,0,"Shri Saraswati Ice & Cold Storage, Veraval",2015,2025],
[180.0,10,0,"Shri Matsya Vikas Kendra. Veraval NOW Smt. Virmlaben Mansukhlal Suyani. Vea",2014,2014],
[67.38,10,0,"Shri Mansukhlal Ramji Suyani. Veraval",1982,2026],
[67.1,10,0,"Shri Jamnadas Hemraj Dodia. Veraval",1981,2025],
[70.0,10,0,"Shri Somnath Marine spares & Storage Depot, Vearaval",2015,2025],
[80.0,10,0,"Shri Pithadia Freezing & Cold storage, Veraval",2015,2025],
[74.32,10,0,"Shri Harilal Virji Pithadia. Veraval",2015,2025],
[214.5,10,0,"M/s Pithadiya Frizing & Cold Storage. Veraval",1995,2000],
[1160.83,10,0,"Dinesh Sea Foods, Veraval",2014,2018],
[99.98,10,0,"Rameshchandra Arjan Fofandi, Veraval",2013,2027],
[2859.15,10,0,"Shri Iswarprakash Ice factory, Veraval",2018,2022],
[1002.93,10,0,"Shri Anurag Sea Foods, Veraval",1996,2011],
[1670.78,10,0,"M/s Elite Ship Yard. Veraval.",1995,2016],
[1989.53,10,0,"M/s Veraval Shipping corporation. Veraval.",1996,2001],
[625.0,10,0,"Shri Jai Sagar Matsyodhog Co.Op. Society Ltd, Veraval",1993,2022],
[1168.21,10,0,"Shri R.J. Trivedi. Veraval NOW, M/s. Trivedi Sons",1971,2015],
[208.82,10,0,"Shri Vallabh Haridas & Co. Veraval.",2000,2014],
[400.0,10,0,"M/s G.F.C.C.A.Ltd, Veraval",2000,2010],
[450.0,10,0,"Shri Jafrabad Machhi Khari-Vechan Sangh, Jafrabad",2000,2005],
[743.59,10,0,"M/s faruq Mohamad Pirani & Co, Veraval",1991,2001],
[49.92,10,0,"Shri Trikamlal. N. Agya. Veraval",2015,2025],
[800.0,10,0,"M/s Parishram Mastyodhyog Co.Op.Mandali,Ltd, Veraval",1995,2024],
[604.08,10,0,"Shri Jalaram Ice Factory, Veraval",1995,2019],
[185.92,10,0,"Shri Kasambhai A. Veraval. Now M/s.Sorathiya Traders",1991,2020],
[540.96,10,0,"Shri Babu. Jamal. Patni. Veraval",1991,1996],
[557.69,10,0,"M/s Iqubal Haji Ibrahim Aybani. Veraval.",1991,2001],
[625.0,10,0,"M/s Mahesh Saw Mills Veraval",1994,1997],
[321.5,10,0,"M/s Bipinchandra Amratlal Pandat. Veraval. Now Bharat Computer weigh bridge",1990,2019],
[1000.0,10,0,"The District Superintendent of Police, Junagadh. Marine Police station at N",2015,2007],
[2000.0,10,0,"Shri Mansukh Ramji Suyani Naliya Godi Area, at Veraval",2015,2024],
[200.0,10,0,"Shri Chamunda Ice & Cold Storage, Veraval",2013,2017],
[841.66,10,0,"Shri Honest Ice & Cold Storage, Veraval",2014,2018],
[300.04,10,0,"Veraval Petroleums, Veraval",2015,2025],
[720.0,10,0,"Chandrakant & Co., Veraval",2017,2026],
[375.0,10,0,"Shri Ganesh Sagar Petroleum, Veraval",2018,2022],
[1425.0,10,0,"M/s. Kalyan Ice & Cold Storage, Mangrol, Pro.Virendra R. Khetarpal",2022,2022],
[485910,11,1,"M/s Petronet LNG Limited",1999,2029,9.70,10932975],
[135708,11,1,"Adani Petronet Dahej Port Pvt Ltd (Plot 1)",2009,2039,2.71,14534416],
[115367,11,1,"Adani Petronet Dahej Port Pvt Ltd (Plot 2)",2009,2039,2.31,7803772],
[4090000,12,2,"M/s Hazira Port Pvt Ltd (409 Ha - Reclaimed)",2007,2037,0.00,1],
[13777009,13,1,"Gujarat Adani Port Ltd / APSEZL Mundra",2000,2030,7.00,2380182],
[471120,2,1,"Swan LNG Pvt Ltd",2017,2047,7.10,56223445],
[47432,1,1,"Bhavnagar Port Infrastructure Pvt Ltd",2024,2054,14.20,14798800],
[288501,4,1,"Nauyaan Shipyard Private Ltd",2025,2055,14.40,14183164],
[11460,4,1,"Modest Infrastructure Private Ltd",2007,2037,0.46,343800],
[109265,4,1,"Alcock Ashdown (Gujarat) Ltd",2007,2037,0.00,1092650]
];

// ═══════════════════════════════════════════════════════════════════
// SCENARIO & TYPE CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const SCEN_KEYS = ['sopc_cur','sopc_rev','opt1','opt2','opt3','opt4','opt5','opt6'];
const SCEN_META = {
  sopc_cur:{label:'SoPC Current',       short:'SoPC Cur', color:'#1e40af',bg:'#dbeafe', rec:false},
  sopc_rev:{label:'SoPC Revised',       short:'SoPC Rev', color:'#1d4ed8',bg:'#bfdbfe', rec:false},
  opt1:    {label:'Opt 1 — Fresh Val',  short:'Opt 1',    color:'#6d28d9',bg:'#ede9fe', rec:false},
  opt2:    {label:'Opt 2 — 40% Factor', short:'Opt 2',    color:'#7c3aed',bg:'#f5f3ff', rec:false},
  opt3:    {label:'Opt 3 — Continue',   short:'Opt 3',    color:'#065f46',bg:'#d1fae5', rec:false},
  opt4:    {label:'Opt 4 — Last+WPI',   short:'Opt 4',    color:'#0f766e',bg:'#ccfbf1', rec:false},
  opt5:    {label:'Opt 5 — 50% Hike',   short:'Opt 5',    color:'#92400e',bg:'#fef3c7', rec:false},
  opt6:    {label:'Opt 6 — Block ✓ REC',short:'Opt 6 ✓',  color:'#14532d',bg:'#bbf7d0', rec:true},
};
const TYPE_META = {
  sopc:               {label:'SoPC Ordinary',      color:'#1e40af',bg:'#dbeafe'},
  lpa:                {label:'LPA Firm Land',       color:'#6d28d9',bg:'#ede9fe'},
  reclaimed_pre2018:  {label:'Reclaimed Pre-2018',  color:'#92400e',bg:'#fef3c7'},
  reclaimed_post2018: {label:'Reclaimed Post-2018', color:'#065f46',bg:'#d1fae5'},
};
const STATUS_META = {
  active:   {label:'Active',   color:'#065f46',bg:'#d1fae5'},
  expiring: {label:'<5 yrs',   color:'#92400e',bg:'#fef3c7'},
  expired:  {label:'Expired',  color:'#991b1b',bg:'#fee2e2'},
};

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
function margF(area, bounds, pcts) {
  const br = [0, ...bounds, Infinity];
  let w = 0, a = 0;
  for (let i = 0; i < 4; i++) {
    const c = Math.max(0, Math.min(area, br[i+1]) - br[i]);
    if (!c) break;
    w += c * pcts[i]; a += c;
  }
  return a ? w / a : pcts[0];
}
function slabI(area, b) { return area <= b[0] ? 0 : area <= b[1] ? 1 : area <= b[2] ? 2 : 3; }
function calcIRR(cfs) {
  if (!cfs || cfs.length < 2) return null;
  let r = 0.08;
  for (let i = 0; i < 200; i++) {
    let n = 0, d = 0;
    for (let t = 0; t < cfs.length; t++) {
      const pv = Math.pow(1 + r, t);
      n += cfs[t] / pv;
      d -= t * cfs[t] / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(d) < 1e-12) break;
    const r1 = r - n / d;
    if (Math.abs(r1 - r) < 1e-8) { r = r1; break; }
    r = Math.max(-0.99, Math.min(9, r1));
  }
  return isNaN(r) || !isFinite(r) ? null : r;
}
function getAnnGrowth(c) {
  if (c.escType === 'wpi') return c.wpiRate / 100;
  if (c.escType === '10pct3yr') return Math.pow(1.1, 1/3) - 1;
  if (c.escType === '20pct3yr') return Math.pow(1.2, 1/3) - 1;
  return Math.pow(1 + c.escPct / 100, 1 / Math.max(1, c.escPeriod)) - 1;
}
function buildCFs(inv, yr1, g, horizon, residual, expiry, curRent) {
  if (inv <= 0) return null;
  const cfs = [-inv];
  const yToExp = Math.max(0, expiry - CY);
  let cR = curRent;
  for (let y = 1; y <= horizon; y++) {
    if (y <= yToExp) { cfs.push(cR); cR *= (1 + g); }
    else { cfs.push(yr1 * Math.pow(1 + g, y - yToExp - 1)); }
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr(v) {
  const c = v / 1e7;
  if (c >= 100) return '₹' + Math.round(c) + ' Cr';
  if (c >= 1)   return '₹' + c.toFixed(2) + ' Cr';
  return '₹' + (v / 1e5).toFixed(1) + ' L';
}
function fmtPct(v) { return v === null ? '—' : (v * 100).toFixed(1) + '%'; }
function fmtChg(v, base) {
  if (!base || base === 0) return '—';
  const p = ((v - base) / Math.abs(base)) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(0) + '%';
}
function fmtMx(v, base) {
  if (!base || base === 0) return '—';
  return (v / base).toFixed(2) + '×';
}
function fmtA(a) {
  return a >= 10000 ? (a / 10000).toFixed(2) + ' Ha' : a.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' sqm';
}

// ═══════════════════════════════════════════════════════════════════
// BUILD INITIAL PLOTS
// ═══════════════════════════════════════════════════════════════════
// RAW format:
//   SoPC      : [area, portIdx, 0, name, leaseStart, leaseEnd]
//   LPA firm  : [area, portIdx, 1, name, leaseStart, leaseEnd, acqCr, currentRent]
//   Reclaimed : [area, portIdx, 2, name, leaseStart, leaseEnd, acqCr, currentRent]
let _id = 0;
function buildPlots() {
  return RAW.map(function(row) {
    const area       = row[0];
    const portIdx    = row[1];
    const lpaCode    = row[2];   // 0=sopc  1=lpa  2=reclaimed_pre2018
    const name       = row[3];
    const leaseStart = row[4] || 2015;
    const leaseEnd   = row[5] || 2025;
    const acqCr      = row[6] || 0;
    const rentOverride = (row[7] !== undefined && row[7] !== null) ? row[7] : null;

    const port   = PORT_NAMES[portIdx];
    const pgIdx  = PG_IDX[port] !== undefined ? PG_IDX[port] : 0;
    const landType = lpaCode === 0 ? 'sopc'
                   : lpaCode === 1 ? 'lpa'
                   : 'reclaimed_pre2018';
    const leaseTerm   = Math.max(5, leaseEnd - leaseStart);
    const currentRent = rentOverride !== null ? rentOverride : (area / 10) * 1018;

    return {
      id: _id++, name, port, portIdx, pgIdx, landType, area,
      currentRent, leaseStart, leaseTerm, acqCr,
      indivVal: null, acqValPsqm: null,
      recYear: lpaCode === 2 ? leaseStart : null,
      notes: '',
    };
  });
}
const INIT_PLOTS = buildPlots();

const DEF_CTRL = {
  sopcCurRate:1018, sopcRevRate:1200,
  portVals:{
    Alang:3000, Bhavnagar:5000, Jafrabad:2500, Jamnagar:4000,
    Magdalla:6000, Mandvi:3000, Mangrol:2000, Navlakhi:2000,
    Okha:3000, Porbandar:4000, Veraval:3000,
    Dahej:7000, Hazira:8000, Mundra:10000,
  },
  portAcq:{
    Alang:200, Bhavnagar:300, Jafrabad:175, Jamnagar:250,
    Magdalla:350, Mandvi:200, Mangrol:150, Navlakhi:150,
    Okha:200, Porbandar:250, Veraval:200,
    Dahej:400, Hazira:450, Mundra:500,
  },
  slabBounds:[1000,10000,100000],
  slabPcts:[100,90,70,50],
  slabUF:[90,85,70,35],
  freshPctMode:'6',   // '1.5' | '6' | 'custom'
  freshPctCustom:10,
  escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6,
  blockPct:50, blockYrs:15, numBlocks:3,
  reclPct:20, rebateYrs:10, rebateDiscount:50,
  holdoverOn:false, penaltyMult:3,
  irrHorizon:30, residualPct:100,
};

// ═══════════════════════════════════════════════════════════════════
// STYLE HELPERS
// ═══════════════════════════════════════════════════════════════════
const INP = {border:'1px solid #d1d5db',borderRadius:4,padding:'3px 7px',fontSize:11,background:'#fff',color:'#111',width:80};
const SEL = {border:'1px solid #d1d5db',borderRadius:4,padding:'3px 6px',fontSize:11,background:'#fff',color:'#111'};
const TH  = {fontSize:10,fontWeight:600,color:'#6b7280',padding:'5px 7px',textAlign:'left',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',whiteSpace:'nowrap'};
const TD  = {fontSize:11,padding:'5px 7px',borderBottom:'1px solid #f3f4f6',verticalAlign:'middle'};
function btnS(active, col) {
  return {fontSize:11,padding:'5px 13px',borderRadius:5,cursor:'pointer',border:'none',
    background:active?(col||'#1e40af'):'#f3f4f6',color:active?'#fff':'#374151',fontWeight:active?700:400};
}
function badge(color, bg) {
  return {fontSize:9,padding:'2px 7px',borderRadius:10,background:bg,color,fontWeight:700,display:'inline-block'};
}
function getFreshPct(c) {
  if (c.freshPctMode === '1.5') return 1.5;
  if (c.freshPctMode === '6')   return 6;
  return c.freshPctCustom || 10;
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function CPSec({ label, open, onToggle, children }) {
  return (
    <div style={{borderBottom:'1px solid #f0f0f0'}}>
      <button onClick={onToggle} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',padding:'7px 10px',background:open?'#eff6ff':'transparent',border:'none',cursor:'pointer',fontSize:11,fontWeight:700,color:'#1e40af',textAlign:'left'}}>
        <span>{label}</span>
        <span style={{fontSize:9,color:'#9ca3af'}}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{padding:'8px 10px 12px'}}>{children}</div>}
    </div>
  );
}
function CPRow({ label, children }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
      <span style={{fontSize:10,color:'#6b7280',flex:1,paddingRight:4}}>{label}</span>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}
function Slider({ val, min, max, step, color, onChange, suffix }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4}}>
      <input type="range" min={min} max={max} step={step||1} value={val}
        onChange={function(e){onChange(+e.target.value);}}
        style={{width:80,accentColor:color||'#1e40af'}}/>
      <span style={{fontSize:10,fontWeight:700,minWidth:38,textAlign:'right',color:color||'#374151'}}>{val}{suffix||''}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════
function ControlPanel({ c, setC }) {
  const [open, setOpen] = useState({rates:true,pvals:false,slab:true,fresh:true,esc:true,opt6:true,recl:false,hold:false,irr:false});
  function tog(k) { setOpen(function(o) { return Object.assign({},o,{[k]:!o[k]}); }); }
  function upd(k) { return function(v) { setC(function(p) { return Object.assign({},p,{[k]:v}); }); }; }
  function updArr(k, i) {
    return function(v) {
      setC(function(p) { const a = p[k].slice(); a[i] = +v; return Object.assign({},p,{[k]:a}); });
    };
  }
  const annG = (getAnnGrowth(c) * 100).toFixed(2);
  const fp = getFreshPct(c);

  return (
    <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden',fontSize:11}}>
      <div style={{background:'#1e3a8a',padding:'8px 10px'}}>
        <p style={{color:'#fff',fontSize:12,fontWeight:700,margin:0}}>⚙️ Control Panel</p>
        <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>All levers — changes update live</p>
      </div>

      {/* A — SoPC */}
      <CPSec label="A — SoPC Rates" open={open.rates} onToggle={function(){tog('rates');}}>
        <CPRow label="Current (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcCurRate} onChange={function(e){upd('sopcCurRate')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Revised (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcRevRate} onChange={function(e){upd('sopcRevRate')(+e.target.value);}}/>
        </CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:3}}>
          Cur: ₹{(c.sopcCurRate/10).toFixed(1)}/sqm &nbsp;|&nbsp; Rev: ₹{(c.sopcRevRate/10).toFixed(1)}/sqm
        </div>
      </CPSec>

      {/* B — Port Valuations — PORT-WISE */}
      <CPSec label="B — Port Valuations (₹/sqm)" open={open.pvals} onToggle={function(){tog('pvals');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Per-port Jantri &amp; acquisition cost. Overridden by individual plot value if entered.</p>
        {/* Column headers */}
        <div style={{display:'grid',gridTemplateColumns:'80px 1fr 1fr',gap:'3px 6px',alignItems:'center',marginBottom:4}}>
          <span style={{fontSize:8,color:'#9ca3af',fontWeight:700}}/>
          <span style={{fontSize:8,color:'#1e40af',fontWeight:700,textAlign:'center'}}>Jantri ₹/sqm</span>
          <span style={{fontSize:8,color:'#065f46',fontWeight:700,textAlign:'center'}}>Hist. Acq ₹/sqm</span>
        </div>
        {PORT_NAMES.map(function(port){
          return (
            <div key={port} style={{display:'grid',gridTemplateColumns:'80px 1fr 1fr',gap:'3px 6px',alignItems:'center',marginBottom:3}}>
              <span style={{fontSize:10,color:'#374151',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={port}>{port}</span>
              <input type="number"
                style={{fontSize:10,padding:'3px 5px',border:'1px solid #bfdbfe',borderRadius:3,width:'100%',boxSizing:'border-box',textAlign:'right',color:'#1e40af',background:'#eff6ff'}}
                value={c.portVals[port] || 0}
                onChange={function(e){
                  setC(function(p){
                    const v=Object.assign({},p.portVals); v[port]=+e.target.value;
                    return Object.assign({},p,{portVals:v});
                  });
                }}/>
              <input type="number"
                style={{fontSize:10,padding:'3px 5px',border:'1px solid #bbf7d0',borderRadius:3,width:'100%',boxSizing:'border-box',textAlign:'right',color:'#065f46',background:'#f0fdf4'}}
                value={c.portAcq[port] || 0}
                onChange={function(e){
                  setC(function(p){
                    const v=Object.assign({},p.portAcq); v[port]=+e.target.value;
                    return Object.assign({},p,{portAcq:v});
                  });
                }}/>
            </div>
          );
        })}
        <div style={{display:'grid',gridTemplateColumns:'80px 1fr 1fr',gap:'0 6px',marginTop:4}}>
          <span/>
          <span style={{fontSize:8,color:'#9ca3af',textAlign:'center'}}>for Opt 1 &amp; 2</span>
          <span style={{fontSize:8,color:'#9ca3af',textAlign:'center'}}>for IRR(Actual)</span>
        </div>
      </CPSec>

      {/* C — Slab Configuration — COMPACT FIXED LAYOUT */}
      <CPSec label="C — Slab Configuration" open={open.slab} onToggle={function(){tog('slab');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Opt 1 &amp; 2 · all land types</p>

        {/* Boundaries — compact 2-col grid */}
        <div style={{background:'#f1f5f9',borderRadius:5,padding:'6px 7px',marginBottom:7}}>
          <p style={{fontSize:9,fontWeight:700,color:'#374151',margin:'0 0 5px'}}>Boundaries (sqm)</p>
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',rowGap:3,columnGap:6,alignItems:'center'}}>
            {[['I→II',0],['II→III',1],['III→IV',2]].map(function(pair){
              return (
                <Fragment key={pair[0]}>
                  <span style={{fontSize:9,color:'#6b7280',fontFamily:'monospace',whiteSpace:'nowrap'}}>{pair[0]}</span>
                  <input type="number"
                    style={{fontSize:10,padding:'2px 5px',border:'1px solid #d1d5db',borderRadius:3,width:'100%',boxSizing:'border-box',textAlign:'right',color:'#111',background:'#fff'}}
                    value={c.slabBounds[pair[1]]}
                    onChange={function(e){updArr('slabBounds',pair[1])(+e.target.value);}}/>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Per-slab cards — 2-col grid for sliders */}
        <p style={{fontSize:9,fontWeight:700,color:'#374151',margin:'0 0 4px'}}>Rent % &amp; Utilisation per Slab</p>
        {['I','II','III','IV'].map(function(l,i){
          const colors = ['#1e40af','#065f46','#92400e','#991b1b'];
          const bgs    = ['#dbeafe','#d1fae5','#fef3c7','#fee2e2'];
          const lo = i===0?'0':(c.slabBounds[i-1]>=1000?(c.slabBounds[i-1]/1000).toFixed(0)+'k':c.slabBounds[i-1]);
          const hi = i===3?'∞':(c.slabBounds[i]>=1000?(c.slabBounds[i]/1000).toFixed(0)+'k':c.slabBounds[i]);
          return (
            <div key={l} style={{marginBottom:4,padding:'5px 7px',background:'#f8fafc',borderRadius:5,border:'1px solid #e5e7eb'}}>
              {/* Badge + range header */}
              <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
                <span style={badge(colors[i],bgs[i])}>S{l}</span>
                <span style={{fontSize:9,color:'#6b7280',fontFamily:'monospace'}}>{lo} – {hi} sqm</span>
              </div>
              {/* Vertically stacked sliders — always fits panel width */}
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {[
                  {label:'Rent %', val:c.slabPcts[i], min:0,  max:150, step:5,  color:colors[i], onChange:function(v){updArr('slabPcts',i)(v);}},
                  {label:'Util %', val:c.slabUF[i],   min:10, max:100, step:5,  color:'#6b7280', onChange:function(v){updArr('slabUF',i)(v);}},
                ].map(function(row){
                  return (
                    <div key={row.label} style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:9,color:'#9ca3af',fontWeight:600,width:36,flexShrink:0}}>{row.label}</span>
                      <input type="range" min={row.min} max={row.max} step={row.step} value={row.val}
                        onChange={function(e){row.onChange(+e.target.value);}}
                        style={{flex:1,minWidth:0,accentColor:row.color}}/>
                      <span style={{fontSize:10,fontWeight:700,color:row.color,width:34,textAlign:'right',flexShrink:0}}>{row.val}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CPSec>

      {/* D — Fresh Valuation % — DYNAMIC with user input */}
      <CPSec label="D — Fresh Valuation % (Opt 1 &amp; 2)" open={open.fresh} onToggle={function(){tog('fresh');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:8}}>Select a preset or enter your own. Drives both Opt 1 and Opt 2.</p>
        <div style={{display:'flex',gap:5,marginBottom:8}}>
          <button onClick={function(){upd('freshPctMode')('1.5');}} style={Object.assign({},btnS(c.freshPctMode==='1.5','#6d28d9'),{flex:1,fontSize:11})}>1.5%</button>
          <button onClick={function(){upd('freshPctMode')('6');}}   style={Object.assign({},btnS(c.freshPctMode==='6','#6d28d9'),  {flex:1,fontSize:11})}>6%</button>
          <button onClick={function(){upd('freshPctMode')('custom');}} style={Object.assign({},btnS(c.freshPctMode==='custom','#6d28d9'),{flex:1,fontSize:11})}>Custom</button>
        </div>
        {c.freshPctMode === 'custom' && (
          <div style={{display:'flex',alignItems:'center',gap:6,background:'#f5f3ff',borderRadius:6,padding:'6px 8px',marginBottom:6}}>
            <span style={{fontSize:10,color:'#6d28d9',fontWeight:600}}>Enter %:</span>
            <input type="number" min={0} max={100} step={0.1}
              style={Object.assign({},INP,{width:70,borderColor:'#7c3aed'})}
              value={c.freshPctCustom}
              onChange={function(e){upd('freshPctCustom')(+e.target.value);}}/>
            <span style={{fontSize:10,color:'#6d28d9'}}>of valuation</span>
          </div>
        )}
        <div style={{background:'#ede9fe',borderRadius:5,padding:'6px 8px',fontSize:9,color:'#5b21b6'}}>
          <strong>Active: {fp}%</strong><br/>
          Opt 1 = Val × {fp}% × slab × util<br/>
          Opt 2 = Val × 40% × {fp}% × slab × util
        </div>
      </CPSec>

      {/* E — Escalation */}
      <CPSec label="E — Escalation (Opt 3–6)" open={open.esc} onToggle={function(){tog('esc');}}>
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
          {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(pair){
            return <button key={pair[0]} onClick={function(){upd('escType')(pair[0]);}} style={Object.assign({},btnS(c.escType===pair[0],'#065f46'),{fontSize:10,padding:'4px 8px'})}>{pair[1]}</button>;
          })}
        </div>
        {c.escType === 'wpi' && (
          <CPRow label="WPI Rate (%)"><input type="number" style={INP} value={c.wpiRate} step={0.5} onChange={function(e){upd('wpiRate')(+e.target.value);}}/></CPRow>
        )}
        {c.escType === 'custom' && (
          <Fragment>
            <CPRow label="Escalation (%)"><input type="number" style={INP} value={c.escPct} onChange={function(e){upd('escPct')(+e.target.value);}}/></CPRow>
            <CPRow label="Every N years"><input type="number" style={INP} value={c.escPeriod} min={1} max={10} onChange={function(e){upd('escPeriod')(+e.target.value);}}/></CPRow>
          </Fragment>
        )}
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Annual equivalent: <strong>{annG}% p.a.</strong></div>
      </CPSec>

      {/* F — Option 6 */}
      <CPSec label="F — Option 6 Block Settings" open={open.opt6} onToggle={function(){tog('opt6');}}>
        <CPRow label="Block step-up %"><Slider val={c.blockPct} min={10} max={150} step={5} color="#14532d" suffix="%" onChange={upd('blockPct')}/></CPRow>
        <CPRow label="Block duration (yrs)"><input type="number" style={INP} value={c.blockYrs} min={5} max={30} onChange={function(e){upd('blockYrs')(+e.target.value);}}/></CPRow>
        <CPRow label="Number of blocks"><input type="number" style={INP} value={c.numBlocks} min={1} max={5} onChange={function(e){upd('numBlocks')(+e.target.value);}}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Post-term: {c.blockYrs*c.numBlocks} yrs &nbsp;·&nbsp; Total tenure: {30+c.blockYrs*c.numBlocks} yrs</div>
      </CPSec>

      {/* G — Reclaimed */}
      <CPSec label="G — Reclaimed Land" open={open.recl} onToggle={function(){tog('recl');}}>
        <CPRow label="% of firm land rent"><Slider val={c.reclPct} min={0} max={100} step={5} color="#92400e" suffix="%" onChange={upd('reclPct')}/></CPRow>
        <CPRow label="Rebate period (yrs)"><Slider val={c.rebateYrs} min={0} max={20} step={1} color="#888" suffix="" onChange={upd('rebateYrs')}/></CPRow>
        <CPRow label="Rebate sub-discount"><Slider val={c.rebateDiscount} min={0} max={100} step={10} color="#888" suffix="%" onChange={upd('rebateDiscount')}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          Pre-2018 base ₹1/Ha · Post-2018 base ₹1,000/Ha<br/>
          After rebate: {c.reclPct}% of firm · During rebate: {(c.reclPct*c.rebateDiscount/100).toFixed(1)}% of firm
        </div>
      </CPSec>

      {/* H — Holdover */}
      <CPSec label="H — Holdover / Penalty" open={open.hold} onToggle={function(){tog('hold');}}>
        <label style={{fontSize:11,display:'flex',alignItems:'center',gap:6,cursor:'pointer',marginBottom:6,color:'#374151'}}>
          <input type="checkbox" checked={c.holdoverOn} onChange={function(e){upd('holdoverOn')(e.target.checked);}}/> Apply penalty to expired leases
        </label>
        {c.holdoverOn && (
          <Fragment>
            <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Expired leases show penalised rent in Existing column (as per LMR)</p>
            <CPRow label="Penalty multiplier"><Slider val={c.penaltyMult} min={1} max={6} step={0.5} color="#991b1b" suffix="×" onChange={upd('penaltyMult')}/></CPRow>
          </Fragment>
        )}
      </CPSec>

      {/* I — IRR */}
      <CPSec label="I — IRR Settings" open={open.irr} onToggle={function(){tog('irr');}}>
        <CPRow label="Horizon (years)"><input type="number" style={INP} value={c.irrHorizon} min={5} max={75} onChange={function(e){upd('irrHorizon')(+e.target.value);}}/></CPRow>
        <CPRow label="Residual val at horizon"><Slider val={c.residualPct} min={0} max={300} step={10} color="#1e40af" suffix="%" onChange={upd('residualPct')}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          IRR(Actual) = return on GMB's real spend<br/>
          IRR(Revalued) = return on today's Jantri value
        </div>
      </CPSec>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PLOT EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function PlotEditor({ plot, onSave, onDelete, onClose, isNew }) {
  const [f, setF] = useState(Object.assign({}, plot));
  function s(k) { return function(e) { setF(function(p) { return Object.assign({},p,{[k]:e.target.value}); }); }; }
  function n(k) { return function(e) { setF(function(p) { return Object.assign({},p,{[k]:e.target.value===''?null:+e.target.value}); }); }; }
  function portChg(e) {
    const port=e.target.value, portIdx=PORT_NAMES.indexOf(port), pgIdx=PG_IDX[port]!==undefined?PG_IDX[port]:0;
    setF(function(p){return Object.assign({},p,{port,portIdx,pgIdx});});
  }
  const fields = [
    ['Lessee / Plot Name','text','name',s,'name',220],
    ['Lease Start Year','number','leaseStart',n,'leaseStart',80],
    ['Lease Term (yrs)','number','leaseTerm',n,'leaseTerm',80],
    ['Area (sqm)','number','area',n,'area',90],
    ['Current Rent (₹/yr)','number','currentRent',n,'currentRent',120],
    ['Acquisition Cost (₹ Cr)','number','acqCr',n,'acqCr',90],
    ['Indiv. Jantri (₹/sqm)','number','indivVal',n,'indivVal',90],
    ['Hist. Acq ₹/sqm','number','acqValPsqm',n,'acqValPsqm',90],
    ['Notes','text','notes',s,'notes',200],
  ];
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:'1.25rem',width:420,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:13,color:'#111'}}>{isNew?'+ Add Plot':'Edit Plot'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
        </div>
        <div style={{marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Port</span>
          <select style={SEL} value={f.port} onChange={portChg}>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}</select>
        </div>
        <div style={{marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Land Type</span>
          <select style={SEL} value={f.landType} onChange={s('landType')}>
            <option value="sopc">SoPC (Ordinary)</option>
            <option value="lpa">LPA (Firm / Greenfield)</option>
            <option value="reclaimed_pre2018">Reclaimed Pre-2018</option>
            <option value="reclaimed_post2018">Reclaimed Post-2018</option>
          </select>
        </div>
        {fields.map(function(fld){
          const [label,type,key,handler,,w]=fld;
          return (
            <div key={key} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:'#6b7280',minWidth:130,flexShrink:0}}>{label}</span>
              <input type={type} style={Object.assign({},INP,{width:w||80})} value={f[key]===null||f[key]===undefined?'':f[key]} onChange={handler(key)} placeholder={type==='number'&&f[key]===null?'group default':''}/>
            </div>
          );
        })}
        {(f.landType==='reclaimed_pre2018'||f.landType==='reclaimed_post2018')&&(
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Reclamation Year</span>
            <input type="number" style={INP} value={f.recYear||''} onChange={n('recYear')}/>
          </div>
        )}
        <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:14,paddingTop:10,borderTop:'1px solid #e5e7eb'}}>
          {!isNew&&<button onClick={function(){if(window.confirm('Delete this plot?'))onDelete(plot.id);}} style={Object.assign({},btnS(false),{color:'#dc2626'})}>Delete</button>}
          <button onClick={onClose} style={btnS(false)}>Cancel</button>
          <button onClick={function(){onSave(Object.assign({},f,{id:plot.id}));}} style={btnS(true,'#1e40af')}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
function RowDetail({ row, onClose, onEdit }) {
  const p=row.p, ex=row.existing, rents=row.rents, irrs=row.irrs;
  const tm=TYPE_META[p.landType]||TYPE_META.sopc;
  const sm=STATUS_META[p.status]||STATUS_META.active;
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}>
      <div style={{background:'#fff',width:520,height:'100%',overflowY:'auto',padding:'1.25rem',boxShadow:'-10px 0 40px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <p style={{fontWeight:700,fontSize:13,margin:0,color:'#111'}}>{p.name}</p>
            <p style={{fontSize:11,color:'#6b7280',margin:'3px 0 0'}}>{p.port} · {fmtA(p.area)} · <span style={badge(tm.color,tm.bg)}>{tm.label}</span> <span style={badge(sm.color,sm.bg)}>{sm.label}</span></p>
          </div>
          <div style={{display:'flex',gap:5}}>
            <button onClick={onEdit} style={btnS(true,'#6d28d9')}>Edit</button>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
          {[['Lease Start',p.leaseStart],['Expiry',p.expiry],['Years Left',p.yearsLeft>0?p.yearsLeft:'Expired'],
            ['Acq. Cost',p.acqCr?'₹'+p.acqCr+' Cr':'—'],['Jantri Val',row.pv?'₹'+row.pv.toLocaleString('en-IN')+'/sqm':'—'],['Existing Rent',fmtCr(ex)]
          ].map(function(item){
            return <div key={item[0]} style={{background:'#f9fafb',borderRadius:6,padding:'6px 8px'}}><p style={{fontSize:9,color:'#9ca3af',margin:0}}>{item[0]}</p><p style={{fontSize:11,fontWeight:600,margin:'2px 0 0',color:'#111'}}>{item[1]}</p></div>;
          })}
        </div>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:4}}>Full Impact — All 8 Scenarios</p>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:8}}>IRR(Actual) = return on GMB's real acquisition spend &nbsp;|&nbsp; IRR(Revalued) = return on today's Jantri value</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead><tr>{['Scenario','Proposed ₹','Change ₹','% Chg','Times','IRR(Actual)','IRR(Reval)'].map(function(h){return <th key={h} style={Object.assign({},TH,{textAlign:h==='Scenario'?'left':'right'})}>{h}</th>;})}</tr></thead>
            <tbody>
              {SCEN_KEYS.map(function(k){
                const sm2=SCEN_META[k],r=rents[k],ir=irrs[k],diff=r-ex,isPos=diff>=0;
                return (
                  <tr key={k} style={{background:k==='opt6'?'#f0fdf4':'#fff'}}>
                    <td style={TD}><span style={badge(sm2.color,sm2.bg)}>{sm2.short}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:600})}>{fmtCr(r)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:600})}>{diff>=0?'+':''}{fmtCr(Math.abs(diff))}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,ex)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right'})}>{fmtMx(r,ex)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.actual>0.08?'#065f46':'#92400e'})}>{fmtPct(ir?ir.actual:null)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.rev>0.04?'#065f46':'#6b7280'})}>{fmtPct(ir?ir.rev:null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {p.notes&&<p style={{fontSize:10,color:'#6b7280',marginTop:8}}>Note: {p.notes}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — REVENUE OVERVIEW (big hero UI)
// ═══════════════════════════════════════════════════════════════════
function RevenueOverview({ computed, bifurc, ctrl }) {
  const existingTotal = bifurc.total ? bifurc.total.existing : 0;

  // Sort scenarios by revenue descending for the bar
  const sorted = SCEN_KEYS.slice().sort(function(a,b){
    return (bifurc.total?bifurc.total[b]:0)-(bifurc.total?bifurc.total[a]:0);
  });
  const maxVal = sorted.length > 0 && bifurc.total ? bifurc.total[sorted[0]] : 1;

  // Top impact plots (opt6)
  const topGain = computed.slice().sort(function(a,b){return (b.rents.opt6-b.existing)-(a.rents.opt6-a.existing);}).slice(0,5);
  const topLoss = computed.slice().sort(function(a,b){return (a.rents.opt6-a.existing)-(b.rents.opt6-b.existing);}).slice(0,5);

  return (
    <div>
      {/* Hero — Existing Revenue */}
      <div style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',borderRadius:10,padding:'1.25rem 1.5rem',marginBottom:12,color:'#fff'}}>
        <p style={{fontSize:11,color:'#93c5fd',margin:'0 0 4px',fontWeight:600,letterSpacing:'0.05em'}}>CURRENT ANNUAL REVENUE — ALL 407 PLOTS</p>
        <p style={{fontSize:32,fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.02em'}}>{fmtCr(existingTotal)}</p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'].map(function(t){
            const d=bifurc[t]; if(!d)return null;
            const tm=TYPE_META[t];
            return (
              <div key={t} style={{borderLeft:'2px solid rgba(255,255,255,0.3)',paddingLeft:10}}>
                <p style={{fontSize:9,color:'#93c5fd',margin:0}}>{tm.label}</p>
                <p style={{fontSize:14,fontWeight:700,margin:'2px 0 0'}}>{fmtCr(d.existing)}</p>
                <p style={{fontSize:9,color:'#bfdbfe',margin:0}}>{d.count} plots</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario cards — 4 per row */}
      <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 8px'}}>Year 1 Annual Revenue — All 8 Policy Scenarios</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {SCEN_KEYS.map(function(k){
          const sm=SCEN_META[k];
          const v=bifurc.total?bifurc.total[k]:0;
          const diff=v-existingTotal;
          const isPos=diff>=0;
          const isRec=sm.rec;
          return (
            <div key={k} style={{background:'#fff',border:isRec?'2px solid #14532d':'1px solid #e5e7eb',borderRadius:8,padding:'0.75rem',boxShadow:isRec?'0 4px 12px rgba(20,83,45,0.15)':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <span style={badge(sm.color,sm.bg)}>{sm.short}</span>
                {isRec&&<span style={{fontSize:8,background:'#14532d',color:'#fff',padding:'1px 5px',borderRadius:8,fontWeight:700}}>REC</span>}
              </div>
              <p style={{fontSize:9,color:'#6b7280',margin:'0 0 4px',lineHeight:1.3}}>{sm.label}</p>
              <p style={{fontSize:20,fontWeight:800,margin:'0 0 4px',color:sm.color}}>{fmtCr(v)}</p>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:isPos?'#065f46':'#991b1b'}}>{fmtChg(v,existingTotal)}</span>
                <span style={{fontSize:9,color:'#9ca3af'}}>vs existing</span>
              </div>
              {/* Mini bar */}
              <div style={{height:4,background:'#f3f4f6',borderRadius:2,marginTop:6}}>
                <div style={{height:'100%',background:sm.color,borderRadius:2,width:Math.max(4,(v/Math.max(maxVal,1))*100)+'%',transition:'width 0.3s'}}/>
              </div>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <span style={{fontSize:9,color:isPos?'#065f46':'#991b1b',fontWeight:600}}>Δ {diff>=0?'+':''}{fmtCr(Math.abs(diff))}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue comparison bar chart (horizontal) */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'1rem',marginBottom:12}}>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 10px'}}>Relative Revenue — Sorted by Amount</p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {/* Existing reference */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:10,color:'#1e40af',minWidth:68,fontWeight:700}}>Existing</span>
            <div style={{flex:1,height:18,background:'#dbeafe',borderRadius:3,position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:(existingTotal/maxVal*100)+'%',background:'#1e40af',borderRadius:3,minWidth:2}}/>
              <span style={{position:'absolute',right:4,top:1,fontSize:9,color:'#fff',fontWeight:700,lineHeight:'16px'}}>{fmtCr(existingTotal)}</span>
            </div>
          </div>
          {sorted.map(function(k){
            const sm=SCEN_META[k]; const v=bifurc.total?bifurc.total[k]:0;
            const w=Math.max(0.5,(v/maxVal)*100);
            return (
              <div key={k} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:10,minWidth:68,color:sm.color,fontWeight:600}}>{sm.short}</span>
                <div style={{flex:1,height:18,background:sm.bg,borderRadius:3,position:'relative'}}>
                  <div style={{position:'absolute',left:0,top:0,height:'100%',width:w+'%',background:sm.color,borderRadius:3,minWidth:2}}/>
                  <span style={{position:'absolute',right:4,top:1,fontSize:9,color:'#fff',fontWeight:700,lineHeight:'16px'}}>{fmtCr(v)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Land type bifurcation */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'1rem',marginBottom:12}}>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 8px'}}>Revenue Bifurcation — Land Type × Scenario (₹ Crore)</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr>
                <th style={Object.assign({},TH,{minWidth:110})}>Land Type</th>
                <th style={Object.assign({},TH,{minWidth:40,textAlign:'right'})}>Plots</th>
                <th style={Object.assign({},TH,{minWidth:70,textAlign:'right',background:'#dbeafe',color:'#1e40af'})}>Existing</th>
                {SCEN_KEYS.map(function(k){return <th key={k} style={Object.assign({},TH,{minWidth:60,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color})}>{SCEN_META[k].short}</th>;})}
              </tr>
            </thead>
            <tbody>
              {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018','total'].map(function(t,ti){
                const d=bifurc[t]; if(!d)return null;
                const isTotal=t==='total';
                const tm=TYPE_META[t];
                return (
                  <tr key={t} style={{background:isTotal?'#f0f9ff':ti%2===0?'#fafafa':'#fff',fontWeight:isTotal?700:400}}>
                    <td style={Object.assign({},TD,{fontWeight:isTotal?700:500})}>
                      {tm?<span style={badge(tm.color,tm.bg)}>{tm.label}</span>:<strong>TOTAL</strong>}
                    </td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af'})}>{d.count}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:'#eff6ff',fontWeight:isTotal?700:600})}>{fmtCr(d.existing)}</td>
                    {SCEN_KEYS.map(function(k){
                      const diff=d[k]-d.existing;const isPos=diff>=0;
                      return (
                        <td key={k} style={Object.assign({},TD,{textAlign:'right',background:SCEN_META[k].bg+'33'})}>
                          <div style={{fontFamily:'monospace',fontWeight:isTotal?700:500}}>{fmtCr(d[k])}</div>
                          {!isTotal&&<div style={{fontSize:8,color:isPos?'#065f46':'#991b1b',fontWeight:700}}>{fmtChg(d[k],d.existing)}</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top impact plots */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'0.875rem'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#065f46',margin:'0 0 8px'}}>↑ Top 5 — Highest Revenue Gain (vs Existing, under Opt 6)</p>
          {topGain.map(function(row,i){
            const diff=row.rents.opt6-row.existing;
            return (
              <div key={row.p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:i<4?'1px solid #f3f4f6':'none'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10,fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#111'}}>{row.p.name}</p>
                  <p style={{fontSize:9,color:'#6b7280',margin:0}}>{row.p.port} · {fmtA(row.p.area)}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:'#065f46',margin:0}}>+{fmtCr(diff)}</p>
                  <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{fmtChg(row.rents.opt6,row.existing)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'0.875rem'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#991b1b',margin:'0 0 8px'}}>↓ Top 5 — Highest Revenue Reduction (vs Existing, under Opt 6)</p>
          {topLoss.map(function(row,i){
            const diff=row.rents.opt6-row.existing;
            return (
              <div key={row.p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:i<4?'1px solid #f3f4f6':'none'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10,fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#111'}}>{row.p.name}</p>
                  <p style={{fontSize:9,color:'#6b7280',margin:0}}>{row.p.port} · {fmtA(row.p.area)}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:'#991b1b',margin:0}}>{fmtCr(diff)}</p>
                  <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{fmtChg(row.rents.opt6,row.existing)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — DETAILED MATRIX
// ═══════════════════════════════════════════════════════════════════
function DetailedMatrix({ computed, onRowClick }) {
  const [search,setSearch]=useState('');
  const [filt,setFilt]=useState({land:'All',port:'All',status:'All',impact:'All'});
  const [sortK,setSortK]=useState('impact');
  const [pg,setPg]=useState(0);
  const PGS=25;

  const filtered=useMemo(function(){
    let arr=computed;
    if(filt.land!=='All')arr=arr.filter(function(r){return r.p.landType===filt.land;});
    if(filt.port!=='All')arr=arr.filter(function(r){return r.p.port===filt.port;});
    if(filt.status!=='All')arr=arr.filter(function(r){return r.p.status===filt.status;});
    if(filt.impact==='Higher')arr=arr.filter(function(r){return r.rents.opt6>r.existing+1;});
    if(filt.impact==='Lower') arr=arr.filter(function(r){return r.rents.opt6<r.existing-1;});
    if(search){const q=search.toLowerCase();arr=arr.filter(function(r){return r.p.name.toLowerCase().includes(q)||r.p.port.toLowerCase().includes(q);});}
    if(sortK==='impact')   arr=arr.slice().sort(function(a,b){return Math.abs(b.rents.opt6-b.existing)-Math.abs(a.rents.opt6-a.existing);});
    else if(sortK==='area')     arr=arr.slice().sort(function(a,b){return b.p.area-a.p.area;});
    else if(sortK==='existing') arr=arr.slice().sort(function(a,b){return b.existing-a.existing;});
    else if(sortK==='expiry')   arr=arr.slice().sort(function(a,b){return a.p.yearsLeft-b.p.yearsLeft;});
    return arr;
  },[computed,filt,search,sortK]);

  const paged=filtered.slice(pg*PGS,(pg+1)*PGS);
  const totalPg=Math.ceil(filtered.length/PGS);

  function setF(k){return function(v){setFilt(function(f){return Object.assign({},f,{[k]:v});});setPg(0);};}

  return (
    <div>
      {/* Filter bar */}
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',alignItems:'center',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'7px 10px'}}>
        <input type="text" placeholder="🔍 Search lessee or port…" value={search} onChange={function(e){setSearch(e.target.value);setPg(0);}} style={Object.assign({},INP,{width:165})}/>
        <select style={SEL} value={filt.land} onChange={function(e){setF('land')(e.target.value);}}>
          <option value="All">All types</option><option value="sopc">SoPC</option><option value="lpa">LPA</option>
          <option value="reclaimed_pre2018">Rec&lt;2018</option><option value="reclaimed_post2018">Rec≥2018</option>
        </select>
        <select style={SEL} value={filt.port} onChange={function(e){setF('port')(e.target.value);}}>
          <option value="All">All ports</option>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}
        </select>
        <select style={SEL} value={filt.status} onChange={function(e){setF('status')(e.target.value);}}>
          <option value="All">All status</option><option value="active">Active</option><option value="expiring">Expiring</option><option value="expired">Expired</option>
        </select>
        <select style={SEL} value={filt.impact} onChange={function(e){setF('impact')(e.target.value);}}>
          <option value="All">All impacts</option><option value="Higher">↑ Higher</option><option value="Lower">↓ Lower</option>
        </select>
        <select style={SEL} value={sortK} onChange={function(e){setSortK(e.target.value);}}>
          <option value="impact">Sort: Impact</option><option value="area">Sort: Area</option>
          <option value="existing">Sort: Existing ₹</option><option value="expiry">Sort: Expiry</option>
        </select>
        <span style={{fontSize:10,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} plots · Click row for full detail</span>
      </div>

      {/* Matrix table */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr style={{background:'#f1f5f9'}}>
                <th style={Object.assign({},TH,{minWidth:28,position:'sticky',left:0,zIndex:2})}>#</th>
                <th style={Object.assign({},TH,{minWidth:140,position:'sticky',left:28,zIndex:2})}>Lessee / Plot</th>
                <th style={Object.assign({},TH,{minWidth:58,position:'sticky',left:168,zIndex:2})}>Port</th>
                <th style={Object.assign({},TH,{minWidth:56})}>Type</th>
                <th style={Object.assign({},TH,{minWidth:68,textAlign:'right'})}>Area</th>
                <th style={Object.assign({},TH,{minWidth:48,textAlign:'right'})}>Expiry</th>
                <th style={Object.assign({},TH,{minWidth:50})}>Status</th>
                <th style={Object.assign({},TH,{minWidth:72,textAlign:'right',background:'#dbeafe',color:'#1e40af',borderLeft:'2px solid #93c5fd'})}>Existing ₹</th>
                {SCEN_KEYS.map(function(k){
                  return <th key={k} colSpan={2} style={Object.assign({},TH,{minWidth:115,textAlign:'center',background:SCEN_META[k].bg,color:SCEN_META[k].color,borderLeft:'1px solid #e5e7eb'})}>{SCEN_META[k].short}</th>;
                })}
              </tr>
              <tr style={{background:'#f8fafc'}}>
                <th style={Object.assign({},TH,{position:'sticky',left:0,zIndex:2})}/>
                <th style={Object.assign({},TH,{position:'sticky',left:28,zIndex:2})}/>
                <th style={Object.assign({},TH,{position:'sticky',left:168,zIndex:2})}/>
                <th style={TH}/><th style={TH}/><th style={TH}/><th style={TH}/>
                <th style={Object.assign({},TH,{background:'#eff6ff',borderLeft:'2px solid #93c5fd'})}/>
                {SCEN_KEYS.map(function(k){
                  return (
                    <Fragment key={k}>
                      <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',borderLeft:'1px solid #e5e7eb',fontSize:9,minWidth:58})}>Rent</th>
                      <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',fontSize:9,minWidth:50})}>% Chg</th>
                    </Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paged.map(function(row, ri){
                const p=row.p, ex=row.existing, rents=row.rents;
                const tm=TYPE_META[p.landType]||TYPE_META.sopc;
                const sm=STATUS_META[p.status]||STATUS_META.active;
                const bg=ri%2===0?'#fff':'#fafafa';
                return (
                  <tr key={p.id} style={{background:bg,cursor:'pointer'}}
                    onClick={function(){onRowClick(row);}}
                    onMouseEnter={function(e){e.currentTarget.style.background='#f0f9ff';}}
                    onMouseLeave={function(e){e.currentTarget.style.background=bg;}}>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af',position:'sticky',left:0,background:bg})}>{pg*PGS+ri+1}</td>
                    <td style={Object.assign({},TD,{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',position:'sticky',left:28,background:bg,fontWeight:p.landType!=='sopc'?700:400})} title={p.name}>
                      <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                      {p.acqCr>0&&<div style={{fontSize:8,color:'#9ca3af'}}>Acq ₹{p.acqCr}Cr</div>}
                    </td>
                    <td style={Object.assign({},TD,{color:'#6b7280',position:'sticky',left:168,background:bg,fontSize:10})}>{p.port}</td>
                    <td style={TD}><span style={badge(tm.color,tm.bg)}>{tm.label.split(' ')[0]}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtA(p.area)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{p.expiry}</td>
                    <td style={TD}><span style={badge(sm.color,sm.bg)}>{sm.label}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:700,background:'#eff6ff',borderLeft:'2px solid #93c5fd',color:'#1e40af'})}>{fmtCr(ex)}</td>
                    {SCEN_KEYS.map(function(k){
                      const r=rents[k], diff=r-ex, isPos=diff>=0;
                      return (
                        <Fragment key={k}>
                          <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',borderLeft:'1px solid #f0f0f0',background:SCEN_META[k].bg+'22'})}>{fmtCr(r)}</td>
                          <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,background:SCEN_META[k].bg+'22',color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,ex)}</td>
                        </Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,padding:'0 2px'}}>
        <span style={{fontSize:10,color:'#6b7280'}}>Page {pg+1} of {totalPg} · {filtered.length} plots</span>
        <div style={{display:'flex',gap:3}}>
          <button disabled={pg===0} onClick={function(){setPg(function(x){return x-1;});}} style={Object.assign({},btnS(false),{opacity:pg===0?0.3:1,fontSize:11})}>← Prev</button>
          {Array.from({length:Math.min(totalPg,7)},function(_,i){return i+Math.max(0,pg-3);}).filter(function(i){return i<totalPg;}).map(function(i){
            return <button key={i} onClick={function(){setPg(i);}} style={btnS(i===pg,'#1e40af')}>{i+1}</button>;
          })}
          <button disabled={pg>=totalPg-1} onClick={function(){setPg(function(x){return x+1;});}} style={Object.assign({},btnS(false),{opacity:pg>=totalPg-1?0.3:1,fontSize:11})}>Next →</button>
        </div>
        <span style={{fontSize:10,color:'#9ca3af'}}>Click row → full IRR detail</span>
      </div>

      <div style={{background:'#f0f9ff',border:'1px solid #bfdbfe',borderRadius:6,padding:'7px 12px',marginTop:8,fontSize:10,color:'#1e40af',lineHeight:1.7}}>
        <strong>Reading guide:</strong> Blue = current Existing rent. Each scenario shows proposed rent + % change. <span style={{color:'#065f46',fontWeight:700}}>Green %</span> = GMB earns more. <span style={{color:'#991b1b',fontWeight:700}}>Red %</span> = lessee gets relief or GMB earns less. Click any row for full detail: ₹ absolute, times multiplier, IRR(Actual), IRR(Revalued). Opt 6 ✓ = GMB recommended option.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// PASSWORD GATE
// ═══════════════════════════════════════════════════════════════════
const CORRECT_PWD = 'gmb2026';

function PasswordGate({ onUnlock }) {
  const [pwd, setPwd]   = useState('');
  const [err, setErr]   = useState(false);
  const [show, setShow] = useState(false);

  function attempt() {
    if (pwd === CORRECT_PWD) { onUnlock(); }
    else { setErr(true); setPwd(''); setTimeout(function(){ setErr(false); }, 2000); }
  }
  function onKey(e) { if (e.key === 'Enter') attempt(); }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:'#fff',borderRadius:14,padding:'2.5rem 2rem',width:340,boxShadow:'0 25px 60px rgba(0,0,0,0.4)',textAlign:'center'}}>
        {/* Logo area */}
        <div style={{width:60,height:60,background:'#1e3a8a',borderRadius:14,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:28}}>⚓</span>
        </div>
        <p style={{fontSize:16,fontWeight:800,color:'#111',margin:'0 0 4px'}}>GMB Land Policy Dashboard</p>
        <p style={{fontSize:11,color:'#6b7280',margin:'0 0 24px'}}>Gujarat Maritime Board — Restricted Access</p>

        {/* Input */}
        <div style={{position:'relative',marginBottom:12}}>
          <input
            type={show ? 'text' : 'password'}
            placeholder="Enter access password"
            value={pwd}
            onChange={function(e){ setPwd(e.target.value); setErr(false); }}
            onKeyDown={onKey}
            style={{width:'100%',boxSizing:'border-box',padding:'10px 40px 10px 14px',fontSize:13,border:err?'2px solid #dc2626':'2px solid #e5e7eb',borderRadius:7,outline:'none',color:'#111',background:err?'#fff5f5':'#fff',transition:'border 0.2s'}}
            autoFocus/>
          <button onClick={function(){setShow(function(s){return !s;});}}
            style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'#9ca3af',padding:0}}>
            {show ? '🙈' : '👁'}
          </button>
        </div>

        {err && (
          <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:6,padding:'6px 10px',marginBottom:10,fontSize:11,color:'#991b1b',fontWeight:600}}>
            ✗ Incorrect password. Please try again.
          </div>
        )}

        <button onClick={attempt}
          style={{width:'100%',padding:'10px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em'}}>
          Access Dashboard →
        </button>

        <p style={{fontSize:9,color:'#d1d5db',marginTop:16,lineHeight:1.5}}>
          Authorised GMB personnel only · Government of Gujarat<br/>
          Ports &amp; Transport Department
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [ctrl,  setCtrl]  = useState(DEF_CTRL);
  const [plots, setPlots] = useState(INIT_PLOTS);
  const [editP, setEditP] = useState(null);
  const [detail,setDetail]= useState(null);
  const [isNew, setIsNew] = useState(false);
  const [cpOpen,setCpOpen]= useState(true);
  const [mainTab,setMainTab] = useState(0);

  // ── SYNC STATE ──────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState(CONFIGURED ? 'loading' : 'no-config');
  const [lastSaved,  setLastSaved]  = useState(null);
  const loaded    = useRef(false);
  const saveTimer = useRef(null);

  // ── LOAD from JSONBin on mount ──────────────────────────────────
  useEffect(function() {
    if (!CONFIGURED) { loaded.current = true; return; }
    fetch(BIN_URL + '/latest', { headers: HDR_READ })
      .then(function(r) { return r.ok ? r.json() : Promise.reject('fetch-err'); })
      .then(function(data) {
        if (data && data.ctrl && Object.keys(data.ctrl).length > 0) {
          setCtrl(Object.assign({}, DEF_CTRL, data.ctrl));
        }
        if (data && data.plots && data.plots.length > 0) {
          setPlots(data.plots);
        }
        setSyncStatus('saved');
        setLastSaved(new Date());
        loaded.current = true;
      })
      .catch(function() {
        setSyncStatus('offline');
        loaded.current = true;
      });
  }, []);

  // ── AUTO-SAVE to JSONBin (debounced 2.5s after last change) ─────
  useEffect(function() {
    if (!loaded.current || !CONFIGURED) return;
    setSyncStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(function() {
      fetch(BIN_URL, {
        method: 'PUT',
        headers: HDR_WRITE,
        body: JSON.stringify({ ctrl: ctrl, plots: plots }),
      })
        .then(function(r) {
          if (r.ok) { setSyncStatus('saved'); setLastSaved(new Date()); }
          else setSyncStatus('error');
        })
        .catch(function() { setSyncStatus('error'); });
    }, 2500);
    return function() { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [ctrl, plots]);

  // ── COMPUTE ENGINE ──────────────────────────────────────────────
  const computed = useMemo(function(){
    const g = getAnnGrowth(ctrl);
    const fp = getFreshPct(ctrl);
    return plots.map(function(p){
      const pv      = p.indivVal || ctrl.portVals[p.port] || 3000;
      const acqPsqm = p.acqValPsqm || ctrl.portAcq[p.port] || 300;
      const invA    = p.acqCr > 0 ? p.acqCr*1e7 : p.area*acqPsqm;
      const invR    = p.area * pv;
      const slFact  = margF(p.area, ctrl.slabBounds, ctrl.slabPcts)/100;
      const uf      = ctrl.slabUF[slabI(p.area, ctrl.slabBounds)]/100;
      const expiry  = (p.leaseStart||CY)+(p.leaseTerm||30);
      const yearsLeft=expiry-CY;
      const status  = yearsLeft>5?'active':yearsLeft>0?'expiring':'expired';
      const isRec   = p.landType==='reclaimed_pre2018'||p.landType==='reclaimed_post2018';
      const reclF   = isRec ? ctrl.reclPct/100 : 1;
      const rebate  = isRec && p.recYear && (CY-p.recYear)<ctrl.rebateYrs;
      const effReclF= rebate ? reclF*(ctrl.rebateDiscount/100) : reclF;
      const baseEx  = p.currentRent;
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;

      function firm(k){
        if(k==='sopc_cur') return (p.area/10)*ctrl.sopcCurRate;
        if(k==='sopc_rev') return (p.area/10)*ctrl.sopcRevRate;
        if(k==='opt1')     return p.area*pv*(fp/100)*slFact*uf;
        if(k==='opt2')     return p.area*pv*0.40*(fp/100)*slFact*uf;
        if(k==='opt3')     return baseEx;
        if(k==='opt4')     return baseEx*(1+ctrl.wpiRate/100);
        if(k==='opt5')     return baseEx*1.5;
        if(k==='opt6')     return baseEx*(1+ctrl.blockPct/100);
        return baseEx;
      }
      const rents={};
      SCEN_KEYS.forEach(function(k){rents[k]=firm(k)*effReclF;});

      const resA=invA*(ctrl.residualPct/100), resR=invR*(ctrl.residualPct/100);
      const irrs={};
      SCEN_KEYS.forEach(function(k){
        const yr1=rents[k];
        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx);
        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx);
        irrs[k]={actual:cfsA?calcIRR(cfsA):null, rev:cfsR?calcIRR(cfsR):null};
      });
      return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, irrs, isRec, effReclF};
    });
  },[plots,ctrl]);

  // ── BIFURCATION ──────────────────────────────────────────────────
  const bifurc = useMemo(function(){
    const types=['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'];
    const result={};
    types.forEach(function(t){
      const rows=computed.filter(function(r){return r.p.landType===t;});
      const entry={existing:rows.reduce(function(s,r){return s+r.existing;},0),count:rows.length};
      SCEN_KEYS.forEach(function(k){entry[k]=rows.reduce(function(s,r){return s+r.rents[k];},0);});
      result[t]=entry;
    });
    const entry={existing:computed.reduce(function(s,r){return s+r.existing;},0),count:computed.length};
    SCEN_KEYS.forEach(function(k){entry[k]=computed.reduce(function(s,r){return s+r.rents[k];},0);});
    result.total=entry;
    return result;
  },[computed]);

  // ── CRUD ─────────────────────────────────────────────────────────
  const savePlot=useCallback(function(p){
    if(isNew) setPlots(function(ps){return ps.concat([Object.assign({},p,{id:_id++})]);});
    else      setPlots(function(ps){return ps.map(function(x){return x.id===p.id?p:x;});});
    setEditP(null); setIsNew(false);
  },[isNew]);
  const delPlot=useCallback(function(id){setPlots(function(ps){return ps.filter(function(x){return x.id!==id;});});setEditP(null);setIsNew(false);},[]);

  function openAdd(){
    setIsNew(true);
    setEditP({id:-1,name:'',port:'Veraval',portIdx:10,pgIdx:3,landType:'sopc',area:500,currentRent:5090,leaseStart:2022,leaseTerm:5,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});
  }

  const TABS=['📊 Revenue Overview','📋 Detailed Matrix'];

  if (!unlocked) {
    return <PasswordGate onUnlock={function(){ setUnlocked(true); }}/>;
  }

  // Loading screen while fetching from JSONBin
  if (syncStatus === 'loading') {
    return (
      <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',system-ui,sans-serif"}}>
        <div style={{textAlign:'center',color:'#fff'}}>
          <div style={{width:52,height:52,border:'4px solid #1e40af',borderTopColor:'#60a5fa',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 0.9s linear infinite'}}/>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{fontSize:14,fontWeight:600,margin:'0 0 6px'}}>Loading dashboard data…</p>
          <p style={{fontSize:11,color:'#93c5fd',margin:0}}>Fetching your saved settings from JSONBin</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#f1f5f9',minHeight:'100vh',fontFamily:"'Inter',system-ui,sans-serif",fontSize:12}}>

      {/* HEADER */}
      <div style={{background:'#1e3a8a',padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
        <div>
          <p style={{color:'#fff',fontSize:13,fontWeight:700,margin:0}}>GMB Land Policy — Revenue Impact Dashboard</p>
          <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>{plots.length} plots · 4 land categories · 8 policy scenarios · Live IRR calculation</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {/* Sync status pill */}
          {(function(){
            const cfg = {
              saved:     {bg:'#14532d', color:'#bbf7d0', icon:'✓', text:'Saved'    + (lastSaved?' · '+lastSaved.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'')},
              saving:    {bg:'#1e3a8a', color:'#bfdbfe', icon:'⟳', text:'Saving…'},
              offline:   {bg:'#7c2d12', color:'#fed7aa', icon:'⚠', text:'Offline — using defaults'},
              error:     {bg:'#7f1d1d', color:'#fecaca', icon:'✗', text:'Save failed — retry…'},
              'no-config':{bg:'#374151',color:'#d1d5db', icon:'⚙', text:'JSONBin not configured'},
            }[syncStatus] || {bg:'#374151',color:'#d1d5db',icon:'…',text:'—'};
            return (
              <div style={{background:cfg.bg,color:cfg.color,fontSize:10,padding:'4px 10px',borderRadius:20,display:'flex',alignItems:'center',gap:5,fontWeight:500,whiteSpace:'nowrap'}}>
                <span style={{fontSize:11}}>{cfg.icon}</span>
                <span>{cfg.text}</span>
              </div>
            );
          })()}
          <button onClick={function(){setCpOpen(function(o){return !o;});}} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'rgba(255,255,255,0.12)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)'}}>
            {cpOpen?'Hide Panel':'Show Panel'}
          </button>
          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:700}}>+ Add Plot</button>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 14px',display:'flex',gap:0}}>
        {TABS.map(function(t,i){
          const active=mainTab===i;
          return (
            <button key={i} onClick={function(){setMainTab(i);}}
              style={{fontSize:12,fontWeight:active?700:400,padding:'10px 18px',cursor:'pointer',background:'transparent',border:'none',
                borderBottom:active?'3px solid #1e40af':'3px solid transparent',
                color:active?'#1e40af':'#6b7280',transition:'all 0.15s'}}>
              {t}
            </button>
          );
        })}
      </div>

      <div style={{display:'flex',gap:10,padding:'10px 12px',alignItems:'flex-start'}}>

        {/* CONTROL PANEL */}
        {cpOpen && (
          <div style={{width:258,flexShrink:0}}>
            <ControlPanel c={ctrl} setC={setCtrl}/>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,minWidth:0}}>
          {mainTab === 0 && <RevenueOverview computed={computed} bifurc={bifurc} ctrl={ctrl}/>}
          {mainTab === 1 && <DetailedMatrix computed={computed} onRowClick={function(row){setDetail(row);}}/>}
        </div>
      </div>

      {/* MODALS */}
      {editP && (
        <PlotEditor plot={editP} onSave={savePlot} onDelete={delPlot}
          onClose={function(){setEditP(null);setIsNew(false);}} isNew={isNew}/>
      )}
      {detail && (
        <RowDetail row={detail}
          onClose={function(){setDetail(null);}}
          onEdit={function(){setEditP(detail.p);setDetail(null);}}/>
      )}
    </div>
  );
}
