require_relative '../lib/Team'
require_relative '../lib/Player'



# Todo.destroy_all
#
# Todo.create(title: 'Todo 1', completed: false);
# Todo.create(title: 'Todo 2', month: "01", day: '01', year: '2018')
# Todo.create(title: 'Todo 3', completed: true)
# Tournament.destroy_all


# Tournament.create(date: '2018-8-4', level: 'Open', entry_fee: '$15')
# Tournament.create(date: '2018-8-11', level: 'Open', entry_fee: '$15')

Team.create(name: 'Pabby', player_ids: '1-2')
Team.create(name: 'Chand/EM', player_ids: '3-4')
Team.create(name: 'Keoni/Hags', player_ids: '5-6')

Player.create(name: 'Paul')
Player.create(name: 'Abby')
Player.create(name: 'Chad')
Player.create(name: 'Emily')
Player.create(name: 'Keoni')
Player.create(name: 'Mike')
