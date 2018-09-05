class CreateTeamsTable < ActiveRecord::Migration[5.1]
  def change
    create_table :teams do |t|
      t.string :name
      t.string :player_ids
    end
  end
end
