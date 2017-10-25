/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var prompts = require('./prompts');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Activity Events
//=========================================================

bot.on('contactRelationUpdate', function (message) {
    if (message.action === 'add') {
        var name = message.user ? message.user.name : null;
        var reply = new builder.Message()
                .address(message.address)
                .text("Hello %s... Thanks for adding me. Ask about our listings or our team.", name || 'there');
        bot.send(reply);
    } else {
        // delete their data
    }
});

bot.on('deleteUserData', function (message) {
    // User asked to delete their data
});

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================
//bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
//bot.endConversationAction('thanks', 'So glad I can help! Feel free to ask more questions :)', { matches: /^thanks/i });
//bot.endConversationAction('ok', 'Ok, so I hope you like talking to me :) Please continue to ask more and I will always do my best to answer correctly', { matches: /^ok/i });
//bot.endConversationAction('awesome', 'You are awesome my friend ;) No need to be shy, come back often!', { matches: /^awesome/i });
//bot.endConversationAction('cool', 'Thanks, you are pretty cool yoursef :)', { matches: /^cool/i });
//bot.endConversationAction('impressive', 'Did you mean me or my listings? Hahaha, obviously you meant the listings ;)', { matches: /^impressive/i });
//bot.beginDialogAction('help', 'Help', { matches: /^help/i });
//bot.beginDialogAction('homes', 'Homes', { matches: /^homes/i });
//bot.beginDialogAction('start', 'Start', { matches: /^start/i });
//bot.beginDialogAction('pictures', 'Pictures', { matches: /^pictures/i });
//bot.beginDialogAction('4 candlewood pictures', '4 Candlewood Pictures', { matches: /^4 candlewood pictures/i });
//bot.beginDialogAction('15 Schill Pictures', '15 schill pictures', { matches: /^15 schill pictures/i });
//bot.beginDialogAction('329 trensch pictures', '329 Trensch Pictures', { matches: /^329 trensch pictures/i });

//=========================================================
// Bots Dialogs
//=========================================================

/** Use Chatlyai LUIS model for the root dialog. */
var model1 = process.env.model || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/7301aa51-d697-434b-b4b4-e2451f8259c3?subscription-key=09614a701cd2474c99dd0e2f129695b3&timezoneOffset=0&verbose=true&q=';
//bot.recognizer(new builder.LuisRecognizer(model1));
//var model2 = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=08311b1d-8177-441b-83ce-eb2afdd66c1b&subscription-key=bbb99690cc2243b6a4d44004ff6ef3e8&q=';
//var model3 = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=7eef5747-baad-4835-a19d-c9809bbb89ed&subscription-key=bbb99690cc2243b6a4d44004ff6ef3e8&q=';
//var model4 = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=ae727b10-8510-449d-a720-774531cd01d2&subscription-key=bbb99690cc2243b6a4d44004ff6ef3e8&q=';
var recognizer1 = new builder.LuisRecognizer(model1);
//var recognizer2 = new builder.LuisRecognizer(model2);
//var recognizer3 = new builder.LuisRecognizer(model3);
//var recognizer4 = new builder.LuisRecognizer(model4);
var intents = new builder.IntentDialog({ recognizers: [recognizer1] });
bot.dialog('/', intents);

/** Answer help related questions like "what can I say?" */
// intents.matches('Help', builder.DialogAction.send(prompts.helpMessage));

intents.matches('goodbye', builder.DialogAction.send("Goodbye :)"));

intents.matches('thanks', builder.DialogAction.send("Sure thing, please ask me more, I love to chat ;)"));

intents.matches('ok', builder.DialogAction.send("If you have anymore questions, just ask!"));

intents.matches('awesome', builder.DialogAction.send("You are awesome, thanks for checking us out :)"));

intents.matches('cool', builder.DialogAction.send("So are you! If you want a Chatly, just head over to https://www.chatly.ai/pricing to signup"));

intents.matches('impressive', builder.DialogAction.send("I chat to impress :) In fact I am on 13 different platforms. I can sell your goods, cheer your brand, explain your listing, or even show your home"));

intents.matches('stinks', builder.DialogAction.send("Tough customer. I am really sorry you don't like me, but please let me know how I can be better and I will learn"));

intents.matches('love', builder.DialogAction.send("Love is in the air... I fell soo lalala. Learn more at https://www.chatly.ai"));

intents.matches('made', builder.DialogAction.send("Made by Chatly, inspired by you: https://www.chatly.ai <3"));

intents.matches('sell', builder.DialogAction.send("- Sure! I can tell people all about your property on Facebook, through Skype, KiK, Telegram, IMessage, Slack and many other channels. Most realtors don’t have this kind of reach."));

intents.matches('buy', builder.DialogAction.send("Just visit me at: https://www.chatly.ai/pricing <3"));

intents.matches('price', builder.DialogAction.send("That’s the best part! It costs 6% of your selling price to hire a realtor for these tasks. I cost $199 to get started"));

intents.onDefault(builder.DialogAction.send("Great question... But at the moment I am unable to answer :( Not to worry though, I am constantly learning and will have that answer shortly. In the meantime type help to see what types of questions I can answer"));


// An action is essentially a card calling a global dialog method
// with respective parameters. So instead of using choice prompts
// or a similar waterfall approach, you can link to separate
// dialogs.
// The dialog action will route the action command to a dialog.

// Create the dialog itself.
intents.matches(/^help/i, [
    function (session) { 
        session.send(prompts.helpMessage);
        var msg = new builder.Message(session)
           .textFormat(builder.TextFormat.xml)
            .attachments([
                new builder.HeroCard(session)
                    .buttons([
                        builder.CardAction.imBack(session, "homes", "My Listings")
                    ])
            ]);

        session.send(msg);
    }
]);

// Otherwise an actions is just a normal card of any type that
// features a dialogAction with the respective parameters.
intents.matches('start', [
    function (session) { 
        session.send("Hi I’m Chatly! How can I help?");
        // Create a new message. Note that cards are managed as attachments
        // that each channel can interpret as they see fit. Remember that some
        // channels are text only, so they will have to adapt.
        var msg = new builder.Message(session)
            .textFormat(builder.TextFormat.xml)
            .attachments([
                // This is the actual hero card. For each card you can add the
                // specific options like title, text and so on.
                new builder.HeroCard(session)
                    .title("Chatly")
                    .subtitle(!"Together we can sell anything!")
                    .text("So here's the deal, you can choose a listing or type one in, like: 15 Schill Place., then just ask me followup questions. Ask: what are the taxes? how much is it? how do I get there? What's up with the basement? I am intelligent and I understan natural language. You can ask for help at anytime or just click help from the persistent menu. Enjoy!")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/58384ee6e11409586f85d0be_Screen%20Shot%202016-11-25%20at%209.46.15%20AM.png")
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "help", "Help"),
                        builder.CardAction.imBack(session, 'homes', "My Listings")
                    ])
            ]);

        // Send the message to the user and end the dialog
        session.send(msg);
    }
]);

intents.matches('Pictures', [
    function (session) {
        session.send("Of course, I can show pictures like this:");

        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("My home's exterior")
                    .subtitle("My husband and I fell in love from the moment we drove by")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/583854b5e11409586f85db7f_pexels-photo-173229.jpg")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/583854b5e11409586f85db7f_pexels-photo-173229.jpg")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "Tell me abou this home", "This home's story")
                    ]),
                new builder.HeroCard(session)
                    .title("This is my favorite space")
                    .subtitle("Serene in the day and romantic by night. I spend a lot of time reading here :)")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838530b45569b016c48b689_photo-1467987506553-8f3916508521.jpeg")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838530b45569b016c48b689_photo-1467987506553-8f3916508521.jpeg")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "How's the great room", "Great Room")
                    ]),
                new builder.HeroCard(session)
                    .title("This room is modern and bright. We loved the simplicity")
                    .subtitle("The windows are my favorite, they are quite large and with latch pull-outs")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/58385307e11409586f85d7eb_photo-1422479278902-8cef24992df0.jpeg")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/58385307e11409586f85d7eb_photo-1422479278902-8cef24992df0.jpeg")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "more about the living room", "Living room")
                    ]),
                new builder.HeroCard(session)
                    .title("This room would be my husband's favorite")
                    .subtitle("We thought this piano fit perfect here. Love the large pull up windows")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838530ad36bab2257299032_photo-1464288550599-43d5a73451b8.jpeg")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838530ad36bab2257299032_photo-1464288550599-43d5a73451b8.jpeg")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "details of the piano room", "Piano room")
                    ]),
                new builder.HeroCard(session)
                    .title("We use the kitchen a lot")
                    .subtitle("We really enjoy it. It has gret utility and it's quaint")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/58385306d36bab2257299030_photo-1414956182841-f9f6c6f0d7c0.jpeg")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/58385306d36bab2257299030_photo-1414956182841-f9f6c6f0d7c0.jpeg")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "I want to know about the kitchen", "Kitchen")
                    ]),
                new builder.HeroCard(session)
                    .title("There's also a cool video")
                    .subtitle("(lets make it sexy ;)")
                    .images([
                        builder.CardImage.create(session, "https://vimeo.com/193072916")
                        .tap(builder.CardAction.showImage(session, "https://vimeo.com/193072916")),
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "How about the pool", "Pool")
                    ]),
                new builder.HeroCard(session)
                    .title("Love it, make a bid")
                    .subtitle("(Prospective buyers can bid :}")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/583871e6d36bab225729d7c6_Offer.png")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/583871e6d36bab225729d7c6_Offer.png"))
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "Make a bid", "Make A Bid")
                    ])
            ]);
        // Show the carousel, then wait for the respective input
        session.send(msg);
    }
]);

intents.matches('Contact', [
    function (session) {
        session.send("Absolutely. I’ll ask their name, email, telephone number and any other details you like. I can also schedule appointments for you through Google Calendar, Like this:");

        // Ask the user to select an item from a carousel.
        var msg = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments([
                new builder.HeroCard(session)
                    .title("Schedule a showing")
                    .subtitle("PLease choose from one of the follwoing dates:")
                    .images([
                        builder.CardImage.create(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838788a64d0592803aa200d_Schedule-a-showing.png")
                        .tap(builder.CardAction.showImage(session, "https://daks2k3a4ib2z.cloudfront.net/57dc3607ecfd13e72205b7b1/5838788a64d0592803aa200d_Schedule-a-showing.png"))
                    ])
                    .buttons([
                        builder.CardAction.imBack(session, "MON 9:30am", "MON 9:30am"),
                        builder.CardAction.imBack(session, "MON 11:00am", "MON 11:00am"),
                        builder.CardAction.imBack(session, "WED 9:00am", "WED 9:00am"),
                        builder.CardAction.imBack(session, "WED 2:00pm", "WED 2:00pm"),
                        builder.CardAction.imBack(session, "More dates", "See more")
                        ])
            ]);
        // Show the carousel, then wait for the respective input
        session.send(msg);
    }
]);

/** 
 * This function the first step in the waterfall for intent handlers. It will use the listing mentioned
 * in the users question if specified and valid. Otherwise it will use the last listing a user asked 
 * about. If it the listing is missing it will prompt the user to pick one. 
 */
function askListing (session, args, next) {
    // First check to see if we either got a listing from LUIS or have a an existing listing
    // that we can multi-turn over.
    var listing;
    var entity = builder.EntityRecognizer.findEntity(args.entities, 'ListingName');
    if (entity) {
        // The user specified a listing so lets look it up to make sure its valid.
        // * This calls the underlying function Prompts.choice() uses to match a users response
        //   to a list of choices. When you pass it an object it will use the field names as the
        //   list of choices to match against. 
        listing = builder.EntityRecognizer.findBestMatch(dataListing, entity.entity);
    } else if (session.dialogData.listing) {
        // Just multi-turn over the existing listing
        listing = session.dialogData.listing;
    }
    
    // Prompt the user to pick a listing if they didn't specify a valid one.
    if (!listing) {
        // Lets see if the user just asked for a listing we don't know about.
        var txt = entity ? session.gettext(prompts.listingUnknown, { listing: entity.entity }) : prompts.listingMissing;
        
        // Prompt the user to pick a listing from the list. They can also ask to cancel the operation.
        builder.Prompts.choice(session, txt, dataListing);
    } else {
        // Great! pass the listing to the next step in the waterfall which will answer the question.
        // * This will match the format of the response returned from Prompts.choice().
        next({ response: listing })
    }
}

/**
 * This function generates a generic answer step for an intent handlers waterfall. The listing to answer
 * a question about will be passed into the step and the specified field from the data will be returned to 
 * the user using the specified answer template. 
 */
function answerQuestion(field, answerTemplate) {
    return function (session, results) {
        // Check to see if we have a listing. The user can cancel picking a listing so IPromptResult.response
        // can be null. 
        if (results.response) {
            // Save listing for multi-turn case and compose answer            
            var listing = session.dialogData.listing = results.response;
            var answer = { listing: listing.entity, value: dataListing[listing.entity][field] };
            session.send(answerTemplate, answer);
        } else {
            session.send(prompts.cancel);
        }
    };
}

var dataListing = {
    '15 Schill Place': {
        style: 'Townhouse/Condo',
        listingDate: 'Jul 1, 2016',
        location: '15 Schill Place, Hillsdale, NJ 07675 | Map it: https://goo.gl/maps/RuhUo7esPGy',
        description: 'Thanks for inquiring! This place is better than new, in fact it just had a major renovation. Once complete, this town house will have a brand new kitchen and new bathrooms. The home is in a younger complex built in 1995. it is also adjacent to the Stonybrook Swim Club with optional membership | Tip: Ask me about the pool and I will give you more info!',
        price: '$499,999',
        taxes: '$11,429',
        maintenance: '$335',
        yearBuilt: '1995',
        sprinklers: 'Sure it does, throught the complex',
        garage: '2 oversized attached garages with remote openers',
        basement: 'Absolutely! A fabulous fully finished basement with a full bathroom and lots of closet space',
        bedrooms: '3 large bedrooms with great sunlight ;)',
        bathrooms: '3 brand new bathrooms!',
        laundryRoom: 'Yes, a really nice one!',
        renovation: 'This home was competely renovated a brand new kitchen and new bathrooms!',
        exterior: 'Vinyl siding',
        floors: 'A mix of hardwood, tile and carpet',
        fireplace: 'Yes, there is a lovely gas fireplace in the living room',
        elevator: 'No, none of the units in this complex have an elevator | If you want an elevator ask me about my listing: 4 Candlewood in Old Tappan',
        pets: 'Yes, pets are allowed',
        pool: 'Stonybrook Manor does not have a pool, however there is a world class swim club just a few steps away. Membership is required, Check it out on Facebool: https://www.facebook.com/pages/Stonybrook-Swim-Club/123641671018492',
        mls: 1627650,
        alarm: 'Yes, hard wired',
        transportation: 'Transportation is close, you can travel by train or from multiple bus stops. Take a look: https://goo.gl/maps/SitdqbzabkG2',
        backyard: 'The lot size is N/A, as it is a townhome and all of the lot is shared. There is a large deck off the modern-eat-in kitchen',
        attic: 'Yes there is an attic',
        levels: '3 levels',
        diningRoom: 'The dining room is open to the kitchen and living room, sharing freshly sanded and coated hardwood floors. There is enough room for the entire family and sliding glass doors open to a large wood deck',
        livingRoom: 'The living room is adorned by a lovely firelplace, large windows and freshly sanded hardwood flooring. The ceilings are vaulted, enhancing the rooms beauty',
        kitchen: 'This kitchen is brand new with beautiful white cabinatry, sporty white subway tile, and stainless steal appliances',
        deal: 'This townhome has been completely renovated and is a bargain, however we encourage and review all submitted offers',
        contact: 'Would love to chat! contact me here: support@muradteam.com',
        size: 'We do not have the approximate sq ft for this unit, but we welcome all serious buyers to have it measured',
        interior: 'This town house has a brand new kitchen and new bathrooms, hardwood floors, plenty of sunlight and vaulted ceilings',
        appliances: 'Brand new appliances are included!',
        heat: 'Gas hot air for the heating sytem',
        airCondition: 'Central AC runs throughout the house',
        website: 'http://muradteam.com/listing/15-schill-place'
    }
};